<script lang="ts">
  import '$lib/styles/reset.css';
  import '$lib/styles/global.css';

  import { browser } from '$app/environment';
  import { createChatObserver } from '$lib/api/chat';
  import Footer from '$lib/components/Footer.svelte';
  import Nav from '$lib/components/Nav/Navigation.svelte';
  import { Notifications, Progress } from '$lib/components/UI';
  import { getCookie, setCookie } from '$lib/util';
  import { createAuthObserver } from '@/lib/api/auth';
  import { initialize } from '@/lib/api/firebase';
  import { isInitializing, user } from '@/lib/stores/auth';
  import { keyboardEvent } from '@/lib/stores/keyboardEvent';
  import registerLocales from '@/locales/register';
  import { onDestroy, onMount } from 'svelte';
  import { init, isLoading as isLocaleLoading, locale } from 'svelte-i18n';
  import { updateCommunicationLanguage } from '@/lib/api/user';
  import MinimalFooter from '@/lib/components/MinimalFooter.svelte';
  import { isActiveContains } from '@/lib/util/isActive';
  import routes from '$lib/routes';
  import { page } from '$app/stores';

  registerLocales();

  locale.subscribe((value) => {
    if (value == null) return;
    // if running in the client, save the language preference in a cookie
    if (typeof window !== 'undefined') {
      setCookie('locale', value, { path: '/' });
      if ($user) updateCommunicationLanguage(value);
    }
  });

  let unsubscribeFromAuthObserver: () => void;
  let unsubscribeFromChatObserver: () => void;

  let lang;

  let vh = `0px`;

  user.subscribe(async (tempUser) => {
    if (!unsubscribeFromChatObserver && tempUser && tempUser.emailVerified)
      unsubscribeFromChatObserver = await createChatObserver(tempUser.uid);

    if (unsubscribeFromChatObserver && !tempUser) unsubscribeFromChatObserver();

    if (tempUser && !tempUser.communicationLanguage && $locale)
      updateCommunicationLanguage($locale);
  });

  onMount(async () => {
    lang = getCookie('locale'); //en or nl or ...
    if (!lang && window.navigator.language)
      // TODO: check if the language is supported
      lang = window.navigator.language.split('-')[0].toLowerCase();
    if (!lang) lang = 'en';

    init({ fallbackLocale: 'en', initialLocale: lang });

    // Initialize Firebase
    await initialize();
    if (!unsubscribeFromAuthObserver) unsubscribeFromAuthObserver = createAuthObserver();

    vh = `${window.innerHeight * 0.01}px`;
  });

  onDestroy(() => {
    if (unsubscribeFromChatObserver) unsubscribeFromChatObserver();
    if (unsubscribeFromAuthObserver) unsubscribeFromAuthObserver();
  });

  const updateViewportHeight = () => {
    vh = `${window.innerHeight * 0.01}px`;
  };

  const onCustomPress = (e: KeyboardEvent) => {
    if (e?.altKey) {
      e.preventDefault();
      e.stopPropagation();
      keyboardEvent.set(e);
    }
  };
</script>

<svelte:window on:resize={updateViewportHeight} on:keyup={onCustomPress} />

<div
  class="app active-{$page?.route?.id?.substring(1).split('/')[0]} locale-{$locale}"
  style="--vh:{vh}"
>
  {#if browser}
    <Progress active={$isInitializing || $isLocaleLoading} />
    <Notifications />
  {/if}

  {#if !$isInitializing && !$isLocaleLoading}
    <Nav />
    <main>
      <slot />
    </main>
    {#if isActiveContains($page, routes.MAP)}
      <MinimalFooter />
    {:else}
      <Footer />
    {/if}
  {/if}
</div>

<style>
  .app {
    width: 100%;
    height: 100%;
    position: relative;
    padding-top: var(--height-nav);
  }

  main {
    min-height: calc(100vh - var(--height-nav) - var(--height-footer));
    width: 100%;
    overflow: hidden;
    /* Anchor overflow:hidden on descendants
    (there was a problem with .welcome-map in LandingSection with this before) */
    position: relative;
    max-width: 155rem;
    margin: 0 auto;
  }

  @media screen and (max-width: 700px) {
    .app {
      padding-top: 0;
    }

    main {
      min-height: calc(100vh - var(--height-mobile-nav) - env(safe-area-inset-bottom));
      padding-bottom: calc(var(--height-mobile-nav) + env(safe-area-inset-bottom));
    }
  }
</style>
