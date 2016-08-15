



<!DOCTYPE html>
<html lang="en" class="">
  <head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# object: http://ogp.me/ns/object# article: http://ogp.me/ns/article# profile: http://ogp.me/ns/profile#">
    <meta charset='utf-8'>
    

    <link crossorigin="anonymous" href="https://assets-cdn.github.com/assets/frameworks-be4c6e0e479a2d4d0eb3159c8772b5bfc4aa39831cb28f5f92cc2e448d93eaa1.css" media="all" rel="stylesheet" />
    <link crossorigin="anonymous" href="https://assets-cdn.github.com/assets/github-e061f099da4e63917b07348efa54461804be20e2de08ee5a484853a23f83fd89.css" media="all" rel="stylesheet" />
    
    
    <link crossorigin="anonymous" href="https://assets-cdn.github.com/assets/site-c31d97cdffdd1a140b356a16a2e2b37db7c98fa23ce2127f79a61bc338af1083.css" media="all" rel="stylesheet" />
    

    <link as="script" href="https://assets-cdn.github.com/assets/frameworks-e473d5424fface697be40bd46eb877027b3ecdc58f266fed330b402413df30d5.js" rel="preload" />
    
    <link as="script" href="https://assets-cdn.github.com/assets/github-5a05539a2ab04f10abd2879546db58882d74e2789b0164a23ac4bfdb431a461f.js" rel="preload" />

    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Language" content="en">
    <meta name="viewport" content="width=device-width">
    
    <title>zenbot/config.js at master · carlos8f/zenbot · GitHub</title>
    <link rel="search" type="application/opensearchdescription+xml" href="/opensearch.xml" title="GitHub">
    <link rel="fluid-icon" href="https://github.com/fluidicon.png" title="GitHub">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
    <meta property="fb:app_id" content="1401488693436528">

      <meta content="https://avatars0.githubusercontent.com/u/106763?v=3&amp;s=400" name="twitter:image:src" /><meta content="@github" name="twitter:site" /><meta content="summary" name="twitter:card" /><meta content="carlos8f/zenbot" name="twitter:title" /><meta content="zenbot - :cat: an automated cryptocurrency trading bot" name="twitter:description" />
      <meta content="https://avatars0.githubusercontent.com/u/106763?v=3&amp;s=400" property="og:image" /><meta content="GitHub" property="og:site_name" /><meta content="object" property="og:type" /><meta content="carlos8f/zenbot" property="og:title" /><meta content="https://github.com/carlos8f/zenbot" property="og:url" /><meta content="zenbot - :cat: an automated cryptocurrency trading bot" property="og:description" />
      <meta name="browser-stats-url" content="https://api.github.com/_private/browser/stats">
    <meta name="browser-errors-url" content="https://api.github.com/_private/browser/errors">
    <link rel="assets" href="https://assets-cdn.github.com/">
    
    <meta name="pjax-timeout" content="1000">
    
    <meta name="request-id" content="546AFD06:13EBC:2F1B64D:57B1F363" data-pjax-transient>

    <meta name="msapplication-TileImage" content="/windows-tile.png">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="selected-link" value="repo_source" data-pjax-transient>

    <meta name="google-site-verification" content="KT5gs8h0wvaagLKAVWq8bbeNwnZZK1r1XQysX3xurLU">
<meta name="google-site-verification" content="ZzhVyEFwb7w3e0-uOTltm8Jsck2F5StVihD0exw2fsA">
    <meta name="google-analytics" content="UA-3769691-2">

<meta content="collector.githubapp.com" name="octolytics-host" /><meta content="github" name="octolytics-app-id" /><meta content="546AFD06:13EBC:2F1B64D:57B1F363" name="octolytics-dimension-request_id" />
<meta content="/&lt;user-name&gt;/&lt;repo-name&gt;/blob/show" data-pjax-transient="true" name="analytics-location" />



  <meta class="js-ga-set" name="dimension1" content="Logged Out">



        <meta name="hostname" content="github.com">
    <meta name="user-login" content="">

        <meta name="expected-hostname" content="github.com">
      <meta name="js-proxy-site-detection-payload" content="ZDVkY2I5MTIyMWNjZmViYmZmMjE2MDMxZTAxNGQzY2ZiMTNlZjgzMDE2ZGUzNDhkNTVkZjQxMmRlNjQ5ZDIyNHx7InJlbW90ZV9hZGRyZXNzIjoiODQuMTA2LjI1My42IiwicmVxdWVzdF9pZCI6IjU0NkFGRDA2OjEzRUJDOjJGMUI2NEQ6NTdCMUYzNjMiLCJ0aW1lc3RhbXAiOjE0NzEyNzk5NzF9">


      <link rel="mask-icon" href="https://assets-cdn.github.com/pinned-octocat.svg" color="#4078c0">
      <link rel="icon" type="image/x-icon" href="https://assets-cdn.github.com/favicon.ico">

    <meta name="html-safe-nonce" content="35a62294325bfb5cc036711b18ec446a0d278416">
    <meta content="d5f06f341ae20f419a66f953f495a8cf7309d16a" name="form-nonce" />

    <meta http-equiv="x-pjax-version" content="c42f6a57d940293e45e2f045b38906ec">
    

      
  <meta name="description" content="zenbot - :cat: an automated cryptocurrency trading bot">
  <meta name="go-import" content="github.com/carlos8f/zenbot git https://github.com/carlos8f/zenbot.git">

  <meta content="106763" name="octolytics-dimension-user_id" /><meta content="carlos8f" name="octolytics-dimension-user_login" /><meta content="62025838" name="octolytics-dimension-repository_id" /><meta content="carlos8f/zenbot" name="octolytics-dimension-repository_nwo" /><meta content="true" name="octolytics-dimension-repository_public" /><meta content="false" name="octolytics-dimension-repository_is_fork" /><meta content="62025838" name="octolytics-dimension-repository_network_root_id" /><meta content="carlos8f/zenbot" name="octolytics-dimension-repository_network_root_nwo" />
  <link href="https://github.com/carlos8f/zenbot/commits/master.atom" rel="alternate" title="Recent Commits to zenbot:master" type="application/atom+xml">


      <link rel="canonical" href="https://github.com/carlos8f/zenbot/blob/master/config.js" data-pjax-transient>
  </head>


  <body class="logged-out  env-production  vis-public page-blob">
    <div id="js-pjax-loader-bar" class="pjax-loader-bar"><div class="progress"></div></div>
    <a href="#start-of-content" tabindex="1" class="accessibility-aid js-skip-to-content">Skip to content</a>

    
    
    



          <header class="site-header js-details-container" role="banner">
  <div class="container-responsive">
    <a class="header-logo-invertocat" href="https://github.com/" aria-label="Homepage" data-ga-click="(Logged out) Header, go to homepage, icon:logo-wordmark">
      <svg aria-hidden="true" class="octicon octicon-mark-github" height="32" version="1.1" viewBox="0 0 16 16" width="32"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>
    </a>

    <button class="btn-link right site-header-toggle js-details-target" type="button" aria-label="Toggle navigation">
      <svg aria-hidden="true" class="octicon octicon-three-bars" height="24" version="1.1" viewBox="0 0 12 16" width="18"><path d="M11.41 9H.59C0 9 0 8.59 0 8c0-.59 0-1 .59-1H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1h.01zm0-4H.59C0 5 0 4.59 0 4c0-.59 0-1 .59-1H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1h.01zM.59 11H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1H.59C0 13 0 12.59 0 12c0-.59 0-1 .59-1z"></path></svg>
    </button>

    <div class="site-header-menu">
      <nav class="site-header-nav site-header-nav-main">
        <a href="/personal" class="js-selected-navigation-item nav-item nav-item-personal" data-ga-click="Header, click, Nav menu - item:personal" data-selected-links="/personal /personal">
          Personal
</a>        <a href="/open-source" class="js-selected-navigation-item nav-item nav-item-opensource" data-ga-click="Header, click, Nav menu - item:opensource" data-selected-links="/open-source /open-source">
          Open source
</a>        <a href="/business" class="js-selected-navigation-item nav-item nav-item-business" data-ga-click="Header, click, Nav menu - item:business" data-selected-links="/business /business/features /business/customers /business">
          Business
</a>        <a href="/explore" class="js-selected-navigation-item nav-item nav-item-explore" data-ga-click="Header, click, Nav menu - item:explore" data-selected-links="/explore /trending /trending/developers /integrations /integrations/feature/code /integrations/feature/collaborate /integrations/feature/ship /explore">
          Explore
</a>      </nav>

      <div class="site-header-actions">
            <a class="btn btn-primary site-header-actions-btn" href="/join?source=header-repo" data-ga-click="(Logged out) Header, clicked Sign up, text:sign-up">Sign up</a>
          <a class="btn site-header-actions-btn mr-2" href="/login?return_to=%2Fcarlos8f%2Fzenbot%2Fblob%2Fmaster%2Fconfig.js" data-ga-click="(Logged out) Header, clicked Sign in, text:sign-in">Sign in</a>
      </div>

        <nav class="site-header-nav site-header-nav-secondary">
          <a class="nav-item" href="/pricing">Pricing</a>
          <a class="nav-item" href="/blog">Blog</a>
          <a class="nav-item" href="https://help.github.com">Support</a>
          <a class="nav-item header-search-link" href="https://github.com/search">Search GitHub</a>
              <div class="header-search scoped-search site-scoped-search js-site-search" role="search">
  <!-- </textarea> --><!-- '"` --><form accept-charset="UTF-8" action="/carlos8f/zenbot/search" class="js-site-search-form" data-scoped-search-url="/carlos8f/zenbot/search" data-unscoped-search-url="/search" method="get"><div style="margin:0;padding:0;display:inline"><input name="utf8" type="hidden" value="&#x2713;" /></div>
    <label class="form-control header-search-wrapper js-chromeless-input-container">
      <div class="header-search-scope">This repository</div>
      <input type="text"
        class="form-control header-search-input js-site-search-focus js-site-search-field is-clearable"
        data-hotkey="s"
        name="q"
        placeholder="Search"
        aria-label="Search this repository"
        data-unscoped-placeholder="Search GitHub"
        data-scoped-placeholder="Search"
        autocapitalize="off">
    </label>
</form></div>

        </nav>
    </div>
  </div>
</header>



    <div id="start-of-content" class="accessibility-aid"></div>

      <div id="js-flash-container">
</div>


    <div role="main">
        <div itemscope itemtype="http://schema.org/SoftwareSourceCode">
    <div id="js-repo-pjax-container" data-pjax-container>
      
<div class="pagehead repohead instapaper_ignore readability-menu experiment-repo-nav">
  <div class="container repohead-details-container">

    

<ul class="pagehead-actions">

  <li>
      <a href="/login?return_to=%2Fcarlos8f%2Fzenbot"
    class="btn btn-sm btn-with-count tooltipped tooltipped-n"
    aria-label="You must be signed in to watch a repository" rel="nofollow">
    <svg aria-hidden="true" class="octicon octicon-eye" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path d="M8.06 2C3 2 0 8 0 8s3 6 8.06 6C13 14 16 8 16 8s-3-6-7.94-6zM8 12c-2.2 0-4-1.78-4-4 0-2.2 1.8-4 4-4 2.22 0 4 1.8 4 4 0 2.22-1.78 4-4 4zm2-4c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"></path></svg>
    Watch
  </a>
  <a class="social-count" href="/carlos8f/zenbot/watchers">
    19
  </a>

  </li>

  <li>
      <a href="/login?return_to=%2Fcarlos8f%2Fzenbot"
    class="btn btn-sm btn-with-count tooltipped tooltipped-n"
    aria-label="You must be signed in to star a repository" rel="nofollow">
    <svg aria-hidden="true" class="octicon octicon-star" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path d="M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74z"></path></svg>
    Star
  </a>

    <a class="social-count js-social-count" href="/carlos8f/zenbot/stargazers">
      37
    </a>

  </li>

  <li>
      <a href="/login?return_to=%2Fcarlos8f%2Fzenbot"
        class="btn btn-sm btn-with-count tooltipped tooltipped-n"
        aria-label="You must be signed in to fork a repository" rel="nofollow">
        <svg aria-hidden="true" class="octicon octicon-repo-forked" height="16" version="1.1" viewBox="0 0 10 16" width="10"><path d="M8 1a1.993 1.993 0 0 0-1 3.72V6L5 8 3 6V4.72A1.993 1.993 0 0 0 2 1a1.993 1.993 0 0 0-1 3.72V6.5l3 3v1.78A1.993 1.993 0 0 0 5 15a1.993 1.993 0 0 0 1-3.72V9.5l3-3V4.72A1.993 1.993 0 0 0 8 1zM2 4.2C1.34 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zm3 10c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zm3-10c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z"></path></svg>
        Fork
      </a>

    <a href="/carlos8f/zenbot/network" class="social-count">
      4
    </a>
  </li>
</ul>

    <h1 class="public ">
  <svg aria-hidden="true" class="octicon octicon-repo" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M4 9H3V8h1v1zm0-3H3v1h1V6zm0-2H3v1h1V4zm0-2H3v1h1V2zm8-1v12c0 .55-.45 1-1 1H6v2l-1.5-1.5L3 16v-2H1c-.55 0-1-.45-1-1V1c0-.55.45-1 1-1h10c.55 0 1 .45 1 1zm-1 10H1v2h2v-1h3v1h5v-2zm0-10H2v9h9V1z"></path></svg>
  <span class="author" itemprop="author"><a href="/carlos8f" class="url fn" rel="author">carlos8f</a></span><!--
--><span class="path-divider">/</span><!--
--><strong itemprop="name"><a href="/carlos8f/zenbot" data-pjax="#js-repo-pjax-container">zenbot</a></strong>

</h1>

  </div>
  <div class="container">
    
<nav class="reponav js-repo-nav js-sidenav-container-pjax"
     itemscope
     itemtype="http://schema.org/BreadcrumbList"
     role="navigation"
     data-pjax="#js-repo-pjax-container">

  <span itemscope itemtype="http://schema.org/ListItem" itemprop="itemListElement">
    <a href="/carlos8f/zenbot" aria-selected="true" class="js-selected-navigation-item selected reponav-item" data-hotkey="g c" data-selected-links="repo_source repo_downloads repo_commits repo_releases repo_tags repo_branches /carlos8f/zenbot" itemprop="url">
      <svg aria-hidden="true" class="octicon octicon-code" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path d="M9.5 3L8 4.5 11.5 8 8 11.5 9.5 13 14 8 9.5 3zm-5 0L0 8l4.5 5L6 11.5 2.5 8 6 4.5 4.5 3z"></path></svg>
      <span itemprop="name">Code</span>
      <meta itemprop="position" content="1">
</a>  </span>

    <span itemscope itemtype="http://schema.org/ListItem" itemprop="itemListElement">
      <a href="/carlos8f/zenbot/issues" class="js-selected-navigation-item reponav-item" data-hotkey="g i" data-selected-links="repo_issues repo_labels repo_milestones /carlos8f/zenbot/issues" itemprop="url">
        <svg aria-hidden="true" class="octicon octicon-issue-opened" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path d="M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"></path></svg>
        <span itemprop="name">Issues</span>
        <span class="counter">12</span>
        <meta itemprop="position" content="2">
</a>    </span>

  <span itemscope itemtype="http://schema.org/ListItem" itemprop="itemListElement">
    <a href="/carlos8f/zenbot/pulls" class="js-selected-navigation-item reponav-item" data-hotkey="g p" data-selected-links="repo_pulls /carlos8f/zenbot/pulls" itemprop="url">
      <svg aria-hidden="true" class="octicon octicon-git-pull-request" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M11 11.28V5c-.03-.78-.34-1.47-.94-2.06C9.46 2.35 8.78 2.03 8 2H7V0L4 3l3 3V4h1c.27.02.48.11.69.31.21.2.3.42.31.69v6.28A1.993 1.993 0 0 0 10 15a1.993 1.993 0 0 0 1-3.72zm-1 2.92c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zM4 3c0-1.11-.89-2-2-2a1.993 1.993 0 0 0-1 3.72v6.56A1.993 1.993 0 0 0 2 15a1.993 1.993 0 0 0 1-3.72V4.72c.59-.34 1-.98 1-1.72zm-.8 10c0 .66-.55 1.2-1.2 1.2-.65 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2zM2 4.2C1.34 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z"></path></svg>
      <span itemprop="name">Pull requests</span>
      <span class="counter">0</span>
      <meta itemprop="position" content="3">
</a>  </span>



  <a href="/carlos8f/zenbot/pulse" class="js-selected-navigation-item reponav-item" data-selected-links="pulse /carlos8f/zenbot/pulse">
    <svg aria-hidden="true" class="octicon octicon-pulse" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path d="M11.5 8L8.8 5.4 6.6 8.5 5.5 1.6 2.38 8H0v2h3.6l.9-1.8.9 5.4L9 8.5l1.6 1.5H14V8z"></path></svg>
    Pulse
</a>
  <a href="/carlos8f/zenbot/graphs" class="js-selected-navigation-item reponav-item" data-selected-links="repo_graphs repo_contributors /carlos8f/zenbot/graphs">
    <svg aria-hidden="true" class="octicon octicon-graph" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path d="M16 14v1H0V0h1v14h15zM5 13H3V8h2v5zm4 0H7V3h2v10zm4 0h-2V6h2v7z"></path></svg>
    Graphs
</a>

</nav>

  </div>
</div>

<div class="container new-discussion-timeline experiment-repo-nav">
  <div class="repository-content">

    

<a href="/carlos8f/zenbot/blob/8c18845a9b6bdf2e5269385f0857d14bdb05e2bd/config.js" class="hidden js-permalink-shortcut" data-hotkey="y">Permalink</a>

<!-- blob contrib key: blob_contributors:v21:f8a1df2350cdd2fb75bbab393803be4e -->

<div class="file-navigation js-zeroclipboard-container">
  
<div class="select-menu branch-select-menu js-menu-container js-select-menu left">
  <button class="btn btn-sm select-menu-button js-menu-target css-truncate" data-hotkey="w"
    
    type="button" aria-label="Switch branches or tags" tabindex="0" aria-haspopup="true">
    <i>Branch:</i>
    <span class="js-select-button css-truncate-target">master</span>
  </button>

  <div class="select-menu-modal-holder js-menu-content js-navigation-container" data-pjax aria-hidden="true">

    <div class="select-menu-modal">
      <div class="select-menu-header">
        <svg aria-label="Close" class="octicon octicon-x js-menu-close" height="16" role="img" version="1.1" viewBox="0 0 12 16" width="12"><path d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z"></path></svg>
        <span class="select-menu-title">Switch branches/tags</span>
      </div>

      <div class="select-menu-filters">
        <div class="select-menu-text-filter">
          <input type="text" aria-label="Filter branches/tags" id="context-commitish-filter-field" class="form-control js-filterable-field js-navigation-enable" placeholder="Filter branches/tags">
        </div>
        <div class="select-menu-tabs">
          <ul>
            <li class="select-menu-tab">
              <a href="#" data-tab-filter="branches" data-filter-placeholder="Filter branches/tags" class="js-select-menu-tab" role="tab">Branches</a>
            </li>
            <li class="select-menu-tab">
              <a href="#" data-tab-filter="tags" data-filter-placeholder="Find a tag…" class="js-select-menu-tab" role="tab">Tags</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="select-menu-list select-menu-tab-bucket js-select-menu-tab-bucket" data-tab-filter="branches" role="menu">

        <div data-filterable-for="context-commitish-filter-field" data-filterable-type="substring">


            <a class="select-menu-item js-navigation-item js-navigation-open "
               href="/carlos8f/zenbot/blob/3.x-actions/config.js"
               data-name="3.x-actions"
               data-skip-pjax="true"
               rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target js-select-menu-filter-text">
                3.x-actions
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
               href="/carlos8f/zenbot/blob/3.x/config.js"
               data-name="3.x"
               data-skip-pjax="true"
               rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target js-select-menu-filter-text">
                3.x
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open selected"
               href="/carlos8f/zenbot/blob/master/config.js"
               data-name="master"
               data-skip-pjax="true"
               rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target js-select-menu-filter-text">
                master
              </span>
            </a>
        </div>

          <div class="select-menu-no-results">Nothing to show</div>
      </div>

      <div class="select-menu-list select-menu-tab-bucket js-select-menu-tab-bucket" data-tab-filter="tags">
        <div data-filterable-for="context-commitish-filter-field" data-filterable-type="substring">


            <a class="select-menu-item js-navigation-item js-navigation-open "
              href="/carlos8f/zenbot/tree/v3.0.3/config.js"
              data-name="v3.0.3"
              data-skip-pjax="true"
              rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target">
                v3.0.3
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
              href="/carlos8f/zenbot/tree/v3.0.2/config.js"
              data-name="v3.0.2"
              data-skip-pjax="true"
              rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target">
                v3.0.2
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
              href="/carlos8f/zenbot/tree/v3.0.1/config.js"
              data-name="v3.0.1"
              data-skip-pjax="true"
              rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target">
                v3.0.1
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
              href="/carlos8f/zenbot/tree/v3.0.0/config.js"
              data-name="v3.0.0"
              data-skip-pjax="true"
              rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target">
                v3.0.0
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
              href="/carlos8f/zenbot/tree/v2.8.0/config.js"
              data-name="v2.8.0"
              data-skip-pjax="true"
              rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target">
                v2.8.0
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
              href="/carlos8f/zenbot/tree/v2.7.0/config.js"
              data-name="v2.7.0"
              data-skip-pjax="true"
              rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target">
                v2.7.0
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
              href="/carlos8f/zenbot/tree/v2.6.0/config.js"
              data-name="v2.6.0"
              data-skip-pjax="true"
              rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target">
                v2.6.0
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
              href="/carlos8f/zenbot/tree/v2.5.2/config.js"
              data-name="v2.5.2"
              data-skip-pjax="true"
              rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target">
                v2.5.2
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
              href="/carlos8f/zenbot/tree/v2.5.1/config.js"
              data-name="v2.5.1"
              data-skip-pjax="true"
              rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target">
                v2.5.1
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
              href="/carlos8f/zenbot/tree/v2.5.0/config.js"
              data-name="v2.5.0"
              data-skip-pjax="true"
              rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target">
                v2.5.0
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
              href="/carlos8f/zenbot/tree/v2.3.0/config.js"
              data-name="v2.3.0"
              data-skip-pjax="true"
              rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target">
                v2.3.0
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
              href="/carlos8f/zenbot/tree/v2.2.0/config.js"
              data-name="v2.2.0"
              data-skip-pjax="true"
              rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target">
                v2.2.0
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
              href="/carlos8f/zenbot/tree/v2.1.1/config.js"
              data-name="v2.1.1"
              data-skip-pjax="true"
              rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target">
                v2.1.1
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
              href="/carlos8f/zenbot/tree/v2.0.0/config.js"
              data-name="v2.0.0"
              data-skip-pjax="true"
              rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target">
                v2.0.0
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
              href="/carlos8f/zenbot/tree/v1.0.4/config.js"
              data-name="v1.0.4"
              data-skip-pjax="true"
              rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target">
                v1.0.4
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
              href="/carlos8f/zenbot/tree/v1.0.3/config.js"
              data-name="v1.0.3"
              data-skip-pjax="true"
              rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target">
                v1.0.3
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
              href="/carlos8f/zenbot/tree/v1.0.2/config.js"
              data-name="v1.0.2"
              data-skip-pjax="true"
              rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target">
                v1.0.2
              </span>
            </a>
            <a class="select-menu-item js-navigation-item js-navigation-open "
              href="/carlos8f/zenbot/tree/v1.0.0/config.js"
              data-name="v1.0.0"
              data-skip-pjax="true"
              rel="nofollow">
              <svg aria-hidden="true" class="octicon octicon-check select-menu-item-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z"></path></svg>
              <span class="select-menu-item-text css-truncate-target">
                v1.0.0
              </span>
            </a>
        </div>

        <div class="select-menu-no-results">Nothing to show</div>
      </div>

    </div>
  </div>
</div>

  <div class="btn-group right">
    <a href="/carlos8f/zenbot/find/master"
          class="js-pjax-capture-input btn btn-sm"
          data-pjax
          data-hotkey="t">
      Find file
    </a>
    <button aria-label="Copy file path to clipboard" class="js-zeroclipboard btn btn-sm zeroclipboard-button tooltipped tooltipped-s" data-copied-hint="Copied!" type="button">Copy path</button>
  </div>
  <div class="breadcrumb js-zeroclipboard-target">
    <span class="repo-root js-repo-root"><span class="js-path-segment"><a href="/carlos8f/zenbot"><span>zenbot</span></a></span></span><span class="separator">/</span><strong class="final-path">config.js</strong>
  </div>
</div>


  <div class="commit-tease">
      <span class="right">
        <a class="commit-tease-sha" href="/carlos8f/zenbot/commit/8c18845a9b6bdf2e5269385f0857d14bdb05e2bd" data-pjax>
          8c18845
        </a>
        <relative-time datetime="2016-08-15T01:11:53Z">Aug 14, 2016</relative-time>
      </span>
      <div>
        <img alt="@carlos8f" class="avatar" height="20" src="https://avatars2.githubusercontent.com/u/106763?v=3&amp;s=40" width="20" />
        <a href="/carlos8f" class="user-mention" rel="author">carlos8f</a>
          <a href="/carlos8f/zenbot/commit/8c18845a9b6bdf2e5269385f0857d14bdb05e2bd" class="message" data-pjax="true" title="default trade logic, 6h RSI">default trade logic, 6h RSI</a>
      </div>

    <div class="commit-tease-contributors">
      <button type="button" class="btn-link muted-link contributors-toggle" data-facebox="#blob_contributors_box">
        <strong>1</strong>
         contributor
      </button>
      
    </div>

    <div id="blob_contributors_box" style="display:none">
      <h2 class="facebox-header" data-facebox-id="facebox-header">Users who have contributed to this file</h2>
      <ul class="facebox-user-list" data-facebox-id="facebox-description">
          <li class="facebox-user-list-item">
            <img alt="@carlos8f" height="24" src="https://avatars0.githubusercontent.com/u/106763?v=3&amp;s=48" width="24" />
            <a href="/carlos8f">carlos8f</a>
          </li>
      </ul>
    </div>
  </div>

<div class="file">
  <div class="file-header">
  <div class="file-actions">

    <div class="btn-group">
      <a href="/carlos8f/zenbot/raw/master/config.js" class="btn btn-sm " id="raw-url">Raw</a>
        <a href="/carlos8f/zenbot/blame/master/config.js" class="btn btn-sm js-update-url-with-hash">Blame</a>
      <a href="/carlos8f/zenbot/commits/master/config.js" class="btn btn-sm " rel="nofollow">History</a>
    </div>


        <button type="button" class="btn-octicon disabled tooltipped tooltipped-nw"
          aria-label="You must be signed in to make or propose changes">
          <svg aria-hidden="true" class="octicon octicon-pencil" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path d="M0 12v3h3l8-8-3-3-8 8zm3 2H1v-2h1v1h1v1zm10.3-9.3L12 6 9 3l1.3-1.3a.996.996 0 0 1 1.41 0l1.59 1.59c.39.39.39 1.02 0 1.41z"></path></svg>
        </button>
        <button type="button" class="btn-octicon btn-octicon-danger disabled tooltipped tooltipped-nw"
          aria-label="You must be signed in to make or propose changes">
          <svg aria-hidden="true" class="octicon octicon-trashcan" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M11 2H9c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1H2c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1v9c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V5c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 12H3V5h1v8h1V5h1v8h1V5h1v8h1V5h1v9zm1-10H2V3h9v1z"></path></svg>
        </button>
  </div>

  <div class="file-info">
      263 lines (261 sloc)
      <span class="file-info-divider"></span>
    8.91 KB
  </div>
</div>

  

  <div itemprop="text" class="blob-wrapper data type-javascript">
      <table class="highlight tab-size js-file-line-container" data-tab-size="8">
      <tr>
        <td id="L1" class="blob-num js-line-number" data-line-number="1"></td>
        <td id="LC1" class="blob-code blob-code-inner js-file-line"><span class="pl-k">var</span> c <span class="pl-k">=</span> <span class="pl-c1">module</span>.<span class="pl-smi">exports</span> <span class="pl-k">=</span> {}</td>
      </tr>
      <tr>
        <td id="L2" class="blob-num js-line-number" data-line-number="2"></td>
        <td id="LC2" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">mongo_url</span> <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&quot;</span>mongodb://localhost:27017/zenbrain<span class="pl-pds">&quot;</span></span> <span class="pl-c">// change if your mongo server isn&#39;t local</span></td>
      </tr>
      <tr>
        <td id="L3" class="blob-num js-line-number" data-line-number="3"></td>
        <td id="LC3" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">mongo_username</span> <span class="pl-k">=</span> <span class="pl-c1">null</span> <span class="pl-c">// normally not needed</span></td>
      </tr>
      <tr>
        <td id="L4" class="blob-num js-line-number" data-line-number="4"></td>
        <td id="LC4" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">mongo_password</span> <span class="pl-k">=</span> <span class="pl-c1">null</span></td>
      </tr>
      <tr>
        <td id="L5" class="blob-num js-line-number" data-line-number="5"></td>
        <td id="LC5" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">bucket_size</span> <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&quot;</span>1m<span class="pl-pds">&quot;</span></span></td>
      </tr>
      <tr>
        <td id="L6" class="blob-num js-line-number" data-line-number="6"></td>
        <td id="LC6" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">reducer_limit</span> <span class="pl-k">=</span> <span class="pl-c1">500</span> <span class="pl-c">// how many thoughts to process per reduce run</span></td>
      </tr>
      <tr>
        <td id="L7" class="blob-num js-line-number" data-line-number="7"></td>
        <td id="LC7" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">reducer_sizes</span> <span class="pl-k">=</span> [<span class="pl-s"><span class="pl-pds">&quot;</span>1m<span class="pl-pds">&quot;</span></span>, <span class="pl-s"><span class="pl-pds">&quot;</span>5m<span class="pl-pds">&quot;</span></span>, <span class="pl-s"><span class="pl-pds">&quot;</span>15m<span class="pl-pds">&quot;</span></span>, <span class="pl-s"><span class="pl-pds">&quot;</span>1h<span class="pl-pds">&quot;</span></span>, <span class="pl-s"><span class="pl-pds">&quot;</span>6h<span class="pl-pds">&quot;</span></span>, <span class="pl-s"><span class="pl-pds">&quot;</span>1d<span class="pl-pds">&quot;</span></span>]</td>
      </tr>
      <tr>
        <td id="L8" class="blob-num js-line-number" data-line-number="8"></td>
        <td id="LC8" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">save_state_interval</span> <span class="pl-k">=</span> <span class="pl-c1">10000</span> <span class="pl-c">// save state</span></td>
      </tr>
      <tr>
        <td id="L9" class="blob-num js-line-number" data-line-number="9"></td>
        <td id="LC9" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">parallel_limit</span> <span class="pl-k">=</span> <span class="pl-c1">8</span> <span class="pl-c">// run this many concurrent tasks</span></td>
      </tr>
      <tr>
        <td id="L10" class="blob-num js-line-number" data-line-number="10"></td>
        <td id="LC10" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">reduce_timeout</span> <span class="pl-k">=</span> <span class="pl-c1">200</span></td>
      </tr>
      <tr>
        <td id="L11" class="blob-num js-line-number" data-line-number="11"></td>
        <td id="LC11" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">run_limit</span> <span class="pl-k">=</span> <span class="pl-c1">100</span></td>
      </tr>
      <tr>
        <td id="L12" class="blob-num js-line-number" data-line-number="12"></td>
        <td id="LC12" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">lock_timeout</span> <span class="pl-k">=</span> <span class="pl-c1">60000</span></td>
      </tr>
      <tr>
        <td id="L13" class="blob-num js-line-number" data-line-number="13"></td>
        <td id="LC13" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">lock_backoff</span> <span class="pl-k">=</span> <span class="pl-c1">20</span></td>
      </tr>
      <tr>
        <td id="L14" class="blob-num js-line-number" data-line-number="14"></td>
        <td id="LC14" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">lock_tries</span> <span class="pl-k">=</span> <span class="pl-c1">100</span></td>
      </tr>
      <tr>
        <td id="L15" class="blob-num js-line-number" data-line-number="15"></td>
        <td id="LC15" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">passive_update_timeout</span> <span class="pl-k">=</span> <span class="pl-c1">5000</span></td>
      </tr>
      <tr>
        <td id="L16" class="blob-num js-line-number" data-line-number="16"></td>
        <td id="LC16" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">return_timeout</span> <span class="pl-k">=</span> <span class="pl-c1">60000</span></td>
      </tr>
      <tr>
        <td id="L17" class="blob-num js-line-number" data-line-number="17"></td>
        <td id="LC17" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">brain_speed_ms</span> <span class="pl-k">=</span> <span class="pl-c1">200</span></td>
      </tr>
      <tr>
        <td id="L18" class="blob-num js-line-number" data-line-number="18"></td>
        <td id="LC18" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">twitter_key</span> <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&quot;</span><span class="pl-pds">&quot;</span></span> <span class="pl-c">// create a twitter app, generate an access token, and add it here</span></td>
      </tr>
      <tr>
        <td id="L19" class="blob-num js-line-number" data-line-number="19"></td>
        <td id="LC19" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">twitter_secret</span> <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&quot;</span><span class="pl-pds">&quot;</span></span></td>
      </tr>
      <tr>
        <td id="L20" class="blob-num js-line-number" data-line-number="20"></td>
        <td id="LC20" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">twitter_access_token</span> <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&quot;</span><span class="pl-pds">&quot;</span></span></td>
      </tr>
      <tr>
        <td id="L21" class="blob-num js-line-number" data-line-number="21"></td>
        <td id="LC21" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">twitter_access_token_secret</span> <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&quot;</span><span class="pl-pds">&quot;</span></span></td>
      </tr>
      <tr>
        <td id="L22" class="blob-num js-line-number" data-line-number="22"></td>
        <td id="LC22" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">assets</span> <span class="pl-k">=</span> [</td>
      </tr>
      <tr>
        <td id="L23" class="blob-num js-line-number" data-line-number="23"></td>
        <td id="LC23" class="blob-code blob-code-inner js-file-line">  <span class="pl-s"><span class="pl-pds">&quot;</span>BTC<span class="pl-pds">&quot;</span></span>,</td>
      </tr>
      <tr>
        <td id="L24" class="blob-num js-line-number" data-line-number="24"></td>
        <td id="LC24" class="blob-code blob-code-inner js-file-line">  <span class="pl-c">//&quot;ETH&quot;,</span></td>
      </tr>
      <tr>
        <td id="L25" class="blob-num js-line-number" data-line-number="25"></td>
        <td id="LC25" class="blob-code blob-code-inner js-file-line">  <span class="pl-c">//&quot;LTC&quot;</span></td>
      </tr>
      <tr>
        <td id="L26" class="blob-num js-line-number" data-line-number="26"></td>
        <td id="LC26" class="blob-code blob-code-inner js-file-line">]</td>
      </tr>
      <tr>
        <td id="L27" class="blob-num js-line-number" data-line-number="27"></td>
        <td id="LC27" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">currencies</span> <span class="pl-k">=</span> [</td>
      </tr>
      <tr>
        <td id="L28" class="blob-num js-line-number" data-line-number="28"></td>
        <td id="LC28" class="blob-code blob-code-inner js-file-line">  <span class="pl-c">//&quot;CNY&quot;,</span></td>
      </tr>
      <tr>
        <td id="L29" class="blob-num js-line-number" data-line-number="29"></td>
        <td id="LC29" class="blob-code blob-code-inner js-file-line">  <span class="pl-c">//&quot;EUR&quot;,</span></td>
      </tr>
      <tr>
        <td id="L30" class="blob-num js-line-number" data-line-number="30"></td>
        <td id="LC30" class="blob-code blob-code-inner js-file-line">  <span class="pl-s"><span class="pl-pds">&quot;</span>USD<span class="pl-pds">&quot;</span></span></td>
      </tr>
      <tr>
        <td id="L31" class="blob-num js-line-number" data-line-number="31"></td>
        <td id="LC31" class="blob-code blob-code-inner js-file-line">]</td>
      </tr>
      <tr>
        <td id="L32" class="blob-num js-line-number" data-line-number="32"></td>
        <td id="LC32" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">enabled_plugins</span> <span class="pl-k">=</span> [</td>
      </tr>
      <tr>
        <td id="L33" class="blob-num js-line-number" data-line-number="33"></td>
        <td id="LC33" class="blob-code blob-code-inner js-file-line">  <span class="pl-c">//&quot;bitfinex&quot;,</span></td>
      </tr>
      <tr>
        <td id="L34" class="blob-num js-line-number" data-line-number="34"></td>
        <td id="LC34" class="blob-code blob-code-inner js-file-line">  <span class="pl-s"><span class="pl-pds">&quot;</span>gdax<span class="pl-pds">&quot;</span></span>,</td>
      </tr>
      <tr>
        <td id="L35" class="blob-num js-line-number" data-line-number="35"></td>
        <td id="LC35" class="blob-code blob-code-inner js-file-line">  <span class="pl-c">//&quot;poloniex&quot;,</span></td>
      </tr>
      <tr>
        <td id="L36" class="blob-num js-line-number" data-line-number="36"></td>
        <td id="LC36" class="blob-code blob-code-inner js-file-line">  <span class="pl-s"><span class="pl-pds">&quot;</span>server<span class="pl-pds">&quot;</span></span></td>
      </tr>
      <tr>
        <td id="L37" class="blob-num js-line-number" data-line-number="37"></td>
        <td id="LC37" class="blob-code blob-code-inner js-file-line">]</td>
      </tr>
      <tr>
        <td id="L38" class="blob-num js-line-number" data-line-number="38"></td>
        <td id="LC38" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">default_graph_period</span> <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&quot;</span>1h<span class="pl-pds">&quot;</span></span></td>
      </tr>
      <tr>
        <td id="L39" class="blob-num js-line-number" data-line-number="39"></td>
        <td id="LC39" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">default_graph_limit</span> <span class="pl-k">=</span> <span class="pl-c1">300</span></td>
      </tr>
      <tr>
        <td id="L40" class="blob-num js-line-number" data-line-number="40"></td>
        <td id="LC40" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">graph_limits</span> <span class="pl-k">=</span> [<span class="pl-c1">50</span>, <span class="pl-c1">100</span>, <span class="pl-c1">150</span>, <span class="pl-c1">200</span>, <span class="pl-c1">300</span>, <span class="pl-c1">500</span>, <span class="pl-c1">1000</span>, <span class="pl-c1">2000</span>]</td>
      </tr>
      <tr>
        <td id="L41" class="blob-num js-line-number" data-line-number="41"></td>
        <td id="LC41" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">graph_selectors</span> <span class="pl-k">=</span> [</td>
      </tr>
      <tr>
        <td id="L42" class="blob-num js-line-number" data-line-number="42"></td>
        <td id="LC42" class="blob-code blob-code-inner js-file-line">  <span class="pl-s"><span class="pl-pds">&quot;</span>gdax.BTC-USD<span class="pl-pds">&quot;</span></span>,</td>
      </tr>
      <tr>
        <td id="L43" class="blob-num js-line-number" data-line-number="43"></td>
        <td id="LC43" class="blob-code blob-code-inner js-file-line">  <span class="pl-c">//&quot;gdax.BTC-EUR&quot;,</span></td>
      </tr>
      <tr>
        <td id="L44" class="blob-num js-line-number" data-line-number="44"></td>
        <td id="LC44" class="blob-code blob-code-inner js-file-line">  <span class="pl-c">//&quot;gdax.ETH-USD&quot;,</span></td>
      </tr>
      <tr>
        <td id="L45" class="blob-num js-line-number" data-line-number="45"></td>
        <td id="LC45" class="blob-code blob-code-inner js-file-line">  <span class="pl-c">//&quot;poloniex.BTC-USD&quot;,</span></td>
      </tr>
      <tr>
        <td id="L46" class="blob-num js-line-number" data-line-number="46"></td>
        <td id="LC46" class="blob-code blob-code-inner js-file-line">  <span class="pl-c">//&quot;bitfinex.BTC-USD&quot;,</span></td>
      </tr>
      <tr>
        <td id="L47" class="blob-num js-line-number" data-line-number="47"></td>
        <td id="LC47" class="blob-code blob-code-inner js-file-line">  <span class="pl-c">//&quot;bitfinex.ETH-USD&quot;,</span></td>
      </tr>
      <tr>
        <td id="L48" class="blob-num js-line-number" data-line-number="48"></td>
        <td id="LC48" class="blob-code blob-code-inner js-file-line">  <span class="pl-c">//&quot;bitfinex.ETH-BTC&quot;,</span></td>
      </tr>
      <tr>
        <td id="L49" class="blob-num js-line-number" data-line-number="49"></td>
        <td id="LC49" class="blob-code blob-code-inner js-file-line">  <span class="pl-c">//&quot;bitfinex.ETC-BTC&quot;,</span></td>
      </tr>
      <tr>
        <td id="L50" class="blob-num js-line-number" data-line-number="50"></td>
        <td id="LC50" class="blob-code blob-code-inner js-file-line">  <span class="pl-c">//&quot;bitfinex.LTC-USD&quot;,</span></td>
      </tr>
      <tr>
        <td id="L51" class="blob-num js-line-number" data-line-number="51"></td>
        <td id="LC51" class="blob-code blob-code-inner js-file-line">  <span class="pl-c">//&quot;bitfinex.LTC-BTC&quot;,</span></td>
      </tr>
      <tr>
        <td id="L52" class="blob-num js-line-number" data-line-number="52"></td>
        <td id="LC52" class="blob-code blob-code-inner js-file-line">  <span class="pl-c">//&quot;bitfinex.ETC-BTC&quot;,</span></td>
      </tr>
      <tr>
        <td id="L53" class="blob-num js-line-number" data-line-number="53"></td>
        <td id="LC53" class="blob-code blob-code-inner js-file-line">  <span class="pl-c">//&quot;bitfinex.ETC-USD&quot;</span></td>
      </tr>
      <tr>
        <td id="L54" class="blob-num js-line-number" data-line-number="54"></td>
        <td id="LC54" class="blob-code blob-code-inner js-file-line">]</td>
      </tr>
      <tr>
        <td id="L55" class="blob-num js-line-number" data-line-number="55"></td>
        <td id="LC55" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">rsi_query_limit</span> <span class="pl-k">=</span> <span class="pl-c1">100</span></td>
      </tr>
      <tr>
        <td id="L56" class="blob-num js-line-number" data-line-number="56"></td>
        <td id="LC56" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">rsi_periods</span> <span class="pl-k">=</span> <span class="pl-c1">14</span></td>
      </tr>
      <tr>
        <td id="L57" class="blob-num js-line-number" data-line-number="57"></td>
        <td id="LC57" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">rsi_reporter_selector</span> <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&quot;</span>gdax.BTC-USD<span class="pl-pds">&quot;</span></span></td>
      </tr>
      <tr>
        <td id="L58" class="blob-num js-line-number" data-line-number="58"></td>
        <td id="LC58" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">rsi_sizes</span> <span class="pl-k">=</span> [<span class="pl-s"><span class="pl-pds">&#39;</span>15m<span class="pl-pds">&#39;</span></span>, <span class="pl-s"><span class="pl-pds">&#39;</span>1h<span class="pl-pds">&#39;</span></span>, <span class="pl-s"><span class="pl-pds">&#39;</span>6h<span class="pl-pds">&#39;</span></span>]</td>
      </tr>
      <tr>
        <td id="L59" class="blob-num js-line-number" data-line-number="59"></td>
        <td id="LC59" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">key</span> <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&#39;</span><span class="pl-pds">&#39;</span></span> <span class="pl-c">// TO ENABLE BOT TRADING: set this to GDAX api key,</span></td>
      </tr>
      <tr>
        <td id="L60" class="blob-num js-line-number" data-line-number="60"></td>
        <td id="LC60" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">secret</span> <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&#39;</span><span class="pl-pds">&#39;</span></span> <span class="pl-c">// set this to GDAX api secret,</span></td>
      </tr>
      <tr>
        <td id="L61" class="blob-num js-line-number" data-line-number="61"></td>
        <td id="LC61" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">passphrase</span> <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&#39;</span><span class="pl-pds">&#39;</span></span> <span class="pl-c">// set this to GDAX api passphrase.</span></td>
      </tr>
      <tr>
        <td id="L62" class="blob-num js-line-number" data-line-number="62"></td>
        <td id="LC62" class="blob-code blob-code-inner js-file-line"><span class="pl-k">var</span> first_run <span class="pl-k">=</span> <span class="pl-c1">true</span></td>
      </tr>
      <tr>
        <td id="L63" class="blob-num js-line-number" data-line-number="63"></td>
        <td id="LC63" class="blob-code blob-code-inner js-file-line"><span class="pl-k">var</span> last_balance_sig</td>
      </tr>
      <tr>
        <td id="L64" class="blob-num js-line-number" data-line-number="64"></td>
        <td id="LC64" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-en">logic</span> <span class="pl-k">=</span> <span class="pl-k">function</span> <span class="pl-en">container</span> (<span class="pl-smi">get</span>, <span class="pl-smi">set</span>, <span class="pl-smi">clear</span>) {</td>
      </tr>
      <tr>
        <td id="L65" class="blob-num js-line-number" data-line-number="65"></td>
        <td id="LC65" class="blob-code blob-code-inner js-file-line">  <span class="pl-k">var</span> o <span class="pl-k">=</span> <span class="pl-en">get</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>utils.object_get<span class="pl-pds">&#39;</span></span>)</td>
      </tr>
      <tr>
        <td id="L66" class="blob-num js-line-number" data-line-number="66"></td>
        <td id="LC66" class="blob-code blob-code-inner js-file-line">  <span class="pl-k">var</span> n <span class="pl-k">=</span> <span class="pl-c1">require</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>numbro<span class="pl-pds">&#39;</span></span>)</td>
      </tr>
      <tr>
        <td id="L67" class="blob-num js-line-number" data-line-number="67"></td>
        <td id="LC67" class="blob-code blob-code-inner js-file-line">  <span class="pl-k">var</span> sig <span class="pl-k">=</span> <span class="pl-c1">require</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>sig<span class="pl-pds">&#39;</span></span>)</td>
      </tr>
      <tr>
        <td id="L68" class="blob-num js-line-number" data-line-number="68"></td>
        <td id="LC68" class="blob-code blob-code-inner js-file-line">  <span class="pl-k">var</span> format_currency <span class="pl-k">=</span> <span class="pl-en">get</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>utils.format_currency<span class="pl-pds">&#39;</span></span>)</td>
      </tr>
      <tr>
        <td id="L69" class="blob-num js-line-number" data-line-number="69"></td>
        <td id="LC69" class="blob-code blob-code-inner js-file-line">  <span class="pl-k">var</span> get_timestamp <span class="pl-k">=</span> <span class="pl-en">get</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>utils.get_timestamp<span class="pl-pds">&#39;</span></span>)</td>
      </tr>
      <tr>
        <td id="L70" class="blob-num js-line-number" data-line-number="70"></td>
        <td id="LC70" class="blob-code blob-code-inner js-file-line">  <span class="pl-k">var</span> CoinbaseExchange <span class="pl-k">=</span> <span class="pl-c1">require</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>coinbase-exchange<span class="pl-pds">&#39;</span></span>)</td>
      </tr>
      <tr>
        <td id="L71" class="blob-num js-line-number" data-line-number="71"></td>
        <td id="LC71" class="blob-code blob-code-inner js-file-line">  <span class="pl-k">var</span> client <span class="pl-k">=</span> <span class="pl-k">new</span> <span class="pl-en">CoinbaseExchange.AuthenticatedClient</span>(<span class="pl-smi">c</span>.<span class="pl-smi">key</span>, <span class="pl-smi">c</span>.<span class="pl-smi">secret</span>, <span class="pl-smi">c</span>.<span class="pl-smi">passphrase</span>)</td>
      </tr>
      <tr>
        <td id="L72" class="blob-num js-line-number" data-line-number="72"></td>
        <td id="LC72" class="blob-code blob-code-inner js-file-line">  <span class="pl-k">var</span> asset <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&#39;</span>BTC<span class="pl-pds">&#39;</span></span></td>
      </tr>
      <tr>
        <td id="L73" class="blob-num js-line-number" data-line-number="73"></td>
        <td id="LC73" class="blob-code blob-code-inner js-file-line">  <span class="pl-k">var</span> currency <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&#39;</span>USD<span class="pl-pds">&#39;</span></span></td>
      </tr>
      <tr>
        <td id="L74" class="blob-num js-line-number" data-line-number="74"></td>
        <td id="LC74" class="blob-code blob-code-inner js-file-line">  <span class="pl-k">var</span> rsi_period <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&#39;</span>6h<span class="pl-pds">&#39;</span></span></td>
      </tr>
      <tr>
        <td id="L75" class="blob-num js-line-number" data-line-number="75"></td>
        <td id="LC75" class="blob-code blob-code-inner js-file-line">  <span class="pl-k">var</span> exchange <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&#39;</span>gdax<span class="pl-pds">&#39;</span></span></td>
      </tr>
      <tr>
        <td id="L76" class="blob-num js-line-number" data-line-number="76"></td>
        <td id="LC76" class="blob-code blob-code-inner js-file-line">  <span class="pl-k">var</span> selector <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&#39;</span>data.trades.<span class="pl-pds">&#39;</span></span> <span class="pl-k">+</span> exchange <span class="pl-k">+</span> <span class="pl-s"><span class="pl-pds">&#39;</span>.<span class="pl-pds">&#39;</span></span> <span class="pl-k">+</span> asset <span class="pl-k">+</span> <span class="pl-s"><span class="pl-pds">&#39;</span>-<span class="pl-pds">&#39;</span></span> <span class="pl-k">+</span> currency</td>
      </tr>
      <tr>
        <td id="L77" class="blob-num js-line-number" data-line-number="77"></td>
        <td id="LC77" class="blob-code blob-code-inner js-file-line">  <span class="pl-k">function</span> <span class="pl-en">onOrder</span> (<span class="pl-smi">err</span>, <span class="pl-smi">resp</span>, <span class="pl-smi">order</span>) {</td>
      </tr>
      <tr>
        <td id="L78" class="blob-num js-line-number" data-line-number="78"></td>
        <td id="LC78" class="blob-code blob-code-inner js-file-line">    <span class="pl-k">if</span> (err) <span class="pl-k">return</span> <span class="pl-en">get</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>logger<span class="pl-pds">&#39;</span></span>).<span class="pl-en">error</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>order err<span class="pl-pds">&#39;</span></span>, err, resp, order, {feed<span class="pl-k">:</span> <span class="pl-s"><span class="pl-pds">&#39;</span>errors<span class="pl-pds">&#39;</span></span>})</td>
      </tr>
      <tr>
        <td id="L79" class="blob-num js-line-number" data-line-number="79"></td>
        <td id="LC79" class="blob-code blob-code-inner js-file-line">    <span class="pl-k">if</span> (<span class="pl-smi">resp</span>.<span class="pl-smi">statusCode</span> <span class="pl-k">!==</span> <span class="pl-c1">200</span>) {</td>
      </tr>
      <tr>
        <td id="L80" class="blob-num js-line-number" data-line-number="80"></td>
        <td id="LC80" class="blob-code blob-code-inner js-file-line">      <span class="pl-en">console</span>.<span class="pl-c1">error</span>(order)</td>
      </tr>
      <tr>
        <td id="L81" class="blob-num js-line-number" data-line-number="81"></td>
        <td id="LC81" class="blob-code blob-code-inner js-file-line">      <span class="pl-k">return</span> <span class="pl-en">get</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>logger<span class="pl-pds">&#39;</span></span>).<span class="pl-en">error</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>non-200 status: <span class="pl-pds">&#39;</span></span> <span class="pl-k">+</span> <span class="pl-smi">resp</span>.<span class="pl-smi">statusCode</span>, {data<span class="pl-k">:</span> {statusCode<span class="pl-k">:</span> <span class="pl-smi">resp</span>.<span class="pl-smi">statusCode</span>, body<span class="pl-k">:</span> order}})</td>
      </tr>
      <tr>
        <td id="L82" class="blob-num js-line-number" data-line-number="82"></td>
        <td id="LC82" class="blob-code blob-code-inner js-file-line">    }</td>
      </tr>
      <tr>
        <td id="L83" class="blob-num js-line-number" data-line-number="83"></td>
        <td id="LC83" class="blob-code blob-code-inner js-file-line">    <span class="pl-en">get</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>logger<span class="pl-pds">&#39;</span></span>).<span class="pl-en">info</span>(exchange, (<span class="pl-s"><span class="pl-pds">&#39;</span>order-id: <span class="pl-pds">&#39;</span></span> <span class="pl-k">+</span> <span class="pl-smi">order</span>.<span class="pl-c1">id</span>).<span class="pl-smi">cyan</span>, {data<span class="pl-k">:</span> {order<span class="pl-k">:</span> order}})</td>
      </tr>
      <tr>
        <td id="L84" class="blob-num js-line-number" data-line-number="84"></td>
        <td id="LC84" class="blob-code blob-code-inner js-file-line">    <span class="pl-k">function</span> <span class="pl-en">getStatus</span> () {</td>
      </tr>
      <tr>
        <td id="L85" class="blob-num js-line-number" data-line-number="85"></td>
        <td id="LC85" class="blob-code blob-code-inner js-file-line">      <span class="pl-smi">client</span>.<span class="pl-en">getOrder</span>(<span class="pl-smi">order</span>.<span class="pl-c1">id</span>, <span class="pl-k">function</span> (<span class="pl-smi">err</span>, <span class="pl-smi">resp</span>, <span class="pl-smi">order</span>) {</td>
      </tr>
      <tr>
        <td id="L86" class="blob-num js-line-number" data-line-number="86"></td>
        <td id="LC86" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">if</span> (err) <span class="pl-k">return</span> <span class="pl-en">get</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>logger<span class="pl-pds">&#39;</span></span>).<span class="pl-en">error</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>getOrder err<span class="pl-pds">&#39;</span></span>, err)</td>
      </tr>
      <tr>
        <td id="L87" class="blob-num js-line-number" data-line-number="87"></td>
        <td id="LC87" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">if</span> (<span class="pl-smi">resp</span>.<span class="pl-smi">statusCode</span> <span class="pl-k">!==</span> <span class="pl-c1">200</span>) {</td>
      </tr>
      <tr>
        <td id="L88" class="blob-num js-line-number" data-line-number="88"></td>
        <td id="LC88" class="blob-code blob-code-inner js-file-line">          <span class="pl-en">console</span>.<span class="pl-c1">error</span>(order)</td>
      </tr>
      <tr>
        <td id="L89" class="blob-num js-line-number" data-line-number="89"></td>
        <td id="LC89" class="blob-code blob-code-inner js-file-line">          <span class="pl-k">return</span> <span class="pl-en">get</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>logger<span class="pl-pds">&#39;</span></span>).<span class="pl-en">error</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>non-200 status from getOrder: <span class="pl-pds">&#39;</span></span> <span class="pl-k">+</span> <span class="pl-smi">resp</span>.<span class="pl-smi">statusCode</span>, {data<span class="pl-k">:</span> {statusCode<span class="pl-k">:</span> <span class="pl-smi">resp</span>.<span class="pl-smi">statusCode</span>, body<span class="pl-k">:</span> order}})</td>
      </tr>
      <tr>
        <td id="L90" class="blob-num js-line-number" data-line-number="90"></td>
        <td id="LC90" class="blob-code blob-code-inner js-file-line">        }</td>
      </tr>
      <tr>
        <td id="L91" class="blob-num js-line-number" data-line-number="91"></td>
        <td id="LC91" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">if</span> (<span class="pl-smi">order</span>.<span class="pl-c1">status</span> <span class="pl-k">===</span> <span class="pl-s"><span class="pl-pds">&#39;</span>done<span class="pl-pds">&#39;</span></span>) {</td>
      </tr>
      <tr>
        <td id="L92" class="blob-num js-line-number" data-line-number="92"></td>
        <td id="LC92" class="blob-code blob-code-inner js-file-line">          <span class="pl-k">return</span> <span class="pl-en">get</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>logger<span class="pl-pds">&#39;</span></span>).<span class="pl-en">info</span>(exchange, (<span class="pl-s"><span class="pl-pds">&#39;</span>order <span class="pl-pds">&#39;</span></span> <span class="pl-k">+</span> <span class="pl-smi">order</span>.<span class="pl-c1">id</span> <span class="pl-k">+</span> <span class="pl-s"><span class="pl-pds">&#39;</span> done: <span class="pl-pds">&#39;</span></span> <span class="pl-k">+</span> <span class="pl-smi">order</span>.<span class="pl-smi">done_reason</span>).<span class="pl-smi">cyan</span>, {data<span class="pl-k">:</span> {order<span class="pl-k">:</span> order}})</td>
      </tr>
      <tr>
        <td id="L93" class="blob-num js-line-number" data-line-number="93"></td>
        <td id="LC93" class="blob-code blob-code-inner js-file-line">        }</td>
      </tr>
      <tr>
        <td id="L94" class="blob-num js-line-number" data-line-number="94"></td>
        <td id="LC94" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">else</span> {</td>
      </tr>
      <tr>
        <td id="L95" class="blob-num js-line-number" data-line-number="95"></td>
        <td id="LC95" class="blob-code blob-code-inner js-file-line">          <span class="pl-en">get</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>logger<span class="pl-pds">&#39;</span></span>).<span class="pl-en">info</span>(exchange, (<span class="pl-s"><span class="pl-pds">&#39;</span>order <span class="pl-pds">&#39;</span></span> <span class="pl-k">+</span> <span class="pl-smi">order</span>.<span class="pl-c1">id</span> <span class="pl-k">+</span> <span class="pl-s"><span class="pl-pds">&#39;</span> <span class="pl-pds">&#39;</span></span> <span class="pl-k">+</span> <span class="pl-smi">order</span>.<span class="pl-c1">status</span>).<span class="pl-smi">cyan</span>, {data<span class="pl-k">:</span> {order<span class="pl-k">:</span> order}})</td>
      </tr>
      <tr>
        <td id="L96" class="blob-num js-line-number" data-line-number="96"></td>
        <td id="LC96" class="blob-code blob-code-inner js-file-line">          <span class="pl-c1">setTimeout</span>(getStatus, <span class="pl-c1">5000</span>)</td>
      </tr>
      <tr>
        <td id="L97" class="blob-num js-line-number" data-line-number="97"></td>
        <td id="LC97" class="blob-code blob-code-inner js-file-line">        }</td>
      </tr>
      <tr>
        <td id="L98" class="blob-num js-line-number" data-line-number="98"></td>
        <td id="LC98" class="blob-code blob-code-inner js-file-line">      })</td>
      </tr>
      <tr>
        <td id="L99" class="blob-num js-line-number" data-line-number="99"></td>
        <td id="LC99" class="blob-code blob-code-inner js-file-line">    }</td>
      </tr>
      <tr>
        <td id="L100" class="blob-num js-line-number" data-line-number="100"></td>
        <td id="LC100" class="blob-code blob-code-inner js-file-line">    <span class="pl-en">getStatus</span>()</td>
      </tr>
      <tr>
        <td id="L101" class="blob-num js-line-number" data-line-number="101"></td>
        <td id="LC101" class="blob-code blob-code-inner js-file-line">  }</td>
      </tr>
      <tr>
        <td id="L102" class="blob-num js-line-number" data-line-number="102"></td>
        <td id="LC102" class="blob-code blob-code-inner js-file-line">  <span class="pl-k">return</span> [</td>
      </tr>
      <tr>
        <td id="L103" class="blob-num js-line-number" data-line-number="103"></td>
        <td id="LC103" class="blob-code blob-code-inner js-file-line">    <span class="pl-c">// BEGIN DEFAULT TRADE LOGIC</span></td>
      </tr>
      <tr>
        <td id="L104" class="blob-num js-line-number" data-line-number="104"></td>
        <td id="LC104" class="blob-code blob-code-inner js-file-line">    <span class="pl-c">// sync balance</span></td>
      </tr>
      <tr>
        <td id="L105" class="blob-num js-line-number" data-line-number="105"></td>
        <td id="LC105" class="blob-code blob-code-inner js-file-line">    <span class="pl-k">function</span> (<span class="pl-smi">tick</span>, <span class="pl-smi">trigger</span>, <span class="pl-smi">rs</span>, <span class="pl-smi">cb</span>) {</td>
      </tr>
      <tr>
        <td id="L106" class="blob-num js-line-number" data-line-number="106"></td>
        <td id="LC106" class="blob-code blob-code-inner js-file-line">      <span class="pl-k">if</span> (<span class="pl-en">get</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>command<span class="pl-pds">&#39;</span></span>) <span class="pl-k">!==</span> <span class="pl-s"><span class="pl-pds">&#39;</span>run<span class="pl-pds">&#39;</span></span> <span class="pl-k">||</span> <span class="pl-k">!</span><span class="pl-smi">c</span>.<span class="pl-smi">key</span>) {</td>
      </tr>
      <tr>
        <td id="L107" class="blob-num js-line-number" data-line-number="107"></td>
        <td id="LC107" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">return</span> <span class="pl-en">cb</span>()</td>
      </tr>
      <tr>
        <td id="L108" class="blob-num js-line-number" data-line-number="108"></td>
        <td id="LC108" class="blob-code blob-code-inner js-file-line">      }</td>
      </tr>
      <tr>
        <td id="L109" class="blob-num js-line-number" data-line-number="109"></td>
        <td id="LC109" class="blob-code blob-code-inner js-file-line">      <span class="pl-smi">client</span>.<span class="pl-en">getAccounts</span>(<span class="pl-k">function</span> (<span class="pl-smi">err</span>, <span class="pl-smi">resp</span>, <span class="pl-smi">accounts</span>) {</td>
      </tr>
      <tr>
        <td id="L110" class="blob-num js-line-number" data-line-number="110"></td>
        <td id="LC110" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">if</span> (err) <span class="pl-k">throw</span> err</td>
      </tr>
      <tr>
        <td id="L111" class="blob-num js-line-number" data-line-number="111"></td>
        <td id="LC111" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">if</span> (<span class="pl-smi">resp</span>.<span class="pl-smi">statusCode</span> <span class="pl-k">!==</span> <span class="pl-c1">200</span>) {</td>
      </tr>
      <tr>
        <td id="L112" class="blob-num js-line-number" data-line-number="112"></td>
        <td id="LC112" class="blob-code blob-code-inner js-file-line">          <span class="pl-en">console</span>.<span class="pl-c1">error</span>(accounts)</td>
      </tr>
      <tr>
        <td id="L113" class="blob-num js-line-number" data-line-number="113"></td>
        <td id="LC113" class="blob-code blob-code-inner js-file-line">          <span class="pl-en">get</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>logger<span class="pl-pds">&#39;</span></span>).<span class="pl-en">error</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>non-200 status from exchange: <span class="pl-pds">&#39;</span></span> <span class="pl-k">+</span> <span class="pl-smi">resp</span>.<span class="pl-smi">statusCode</span>, {data<span class="pl-k">:</span> {statusCode<span class="pl-k">:</span> <span class="pl-smi">resp</span>.<span class="pl-smi">statusCode</span>, body<span class="pl-k">:</span> accounts}})</td>
      </tr>
      <tr>
        <td id="L114" class="blob-num js-line-number" data-line-number="114"></td>
        <td id="LC114" class="blob-code blob-code-inner js-file-line">          <span class="pl-k">return</span> cb <span class="pl-k">&amp;&amp;</span> <span class="pl-en">cb</span>()</td>
      </tr>
      <tr>
        <td id="L115" class="blob-num js-line-number" data-line-number="115"></td>
        <td id="LC115" class="blob-code blob-code-inner js-file-line">        }</td>
      </tr>
      <tr>
        <td id="L116" class="blob-num js-line-number" data-line-number="116"></td>
        <td id="LC116" class="blob-code blob-code-inner js-file-line">        <span class="pl-smi">rs</span>.<span class="pl-smi">balance</span> <span class="pl-k">=</span> {}</td>
      </tr>
      <tr>
        <td id="L117" class="blob-num js-line-number" data-line-number="117"></td>
        <td id="LC117" class="blob-code blob-code-inner js-file-line">        <span class="pl-smi">accounts</span>.<span class="pl-en">forEach</span>(<span class="pl-k">function</span> (<span class="pl-smi">account</span>) {</td>
      </tr>
      <tr>
        <td id="L118" class="blob-num js-line-number" data-line-number="118"></td>
        <td id="LC118" class="blob-code blob-code-inner js-file-line">          <span class="pl-k">if</span> (<span class="pl-smi">account</span>.<span class="pl-smi">currency</span> <span class="pl-k">===</span> currency) {</td>
      </tr>
      <tr>
        <td id="L119" class="blob-num js-line-number" data-line-number="119"></td>
        <td id="LC119" class="blob-code blob-code-inner js-file-line">            <span class="pl-smi">rs</span>.<span class="pl-smi">balance</span>[currency] <span class="pl-k">=</span> <span class="pl-en">n</span>(<span class="pl-smi">account</span>.<span class="pl-smi">balance</span>).<span class="pl-c1">value</span>()</td>
      </tr>
      <tr>
        <td id="L120" class="blob-num js-line-number" data-line-number="120"></td>
        <td id="LC120" class="blob-code blob-code-inner js-file-line">          }</td>
      </tr>
      <tr>
        <td id="L121" class="blob-num js-line-number" data-line-number="121"></td>
        <td id="LC121" class="blob-code blob-code-inner js-file-line">          <span class="pl-k">else</span> <span class="pl-k">if</span> (<span class="pl-smi">account</span>.<span class="pl-smi">currency</span> <span class="pl-k">===</span> asset) {</td>
      </tr>
      <tr>
        <td id="L122" class="blob-num js-line-number" data-line-number="122"></td>
        <td id="LC122" class="blob-code blob-code-inner js-file-line">            <span class="pl-smi">rs</span>.<span class="pl-smi">balance</span>[asset] <span class="pl-k">=</span> <span class="pl-en">n</span>(<span class="pl-smi">account</span>.<span class="pl-smi">balance</span>).<span class="pl-c1">value</span>()</td>
      </tr>
      <tr>
        <td id="L123" class="blob-num js-line-number" data-line-number="123"></td>
        <td id="LC123" class="blob-code blob-code-inner js-file-line">          }</td>
      </tr>
      <tr>
        <td id="L124" class="blob-num js-line-number" data-line-number="124"></td>
        <td id="LC124" class="blob-code blob-code-inner js-file-line">        })</td>
      </tr>
      <tr>
        <td id="L125" class="blob-num js-line-number" data-line-number="125"></td>
        <td id="LC125" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">var</span> balance_sig <span class="pl-k">=</span> <span class="pl-en">sig</span>(<span class="pl-smi">rs</span>.<span class="pl-smi">balance</span>)</td>
      </tr>
      <tr>
        <td id="L126" class="blob-num js-line-number" data-line-number="126"></td>
        <td id="LC126" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">if</span> (balance_sig <span class="pl-k">!==</span> last_balance_sig) {</td>
      </tr>
      <tr>
        <td id="L127" class="blob-num js-line-number" data-line-number="127"></td>
        <td id="LC127" class="blob-code blob-code-inner js-file-line">          <span class="pl-en">get</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>logger<span class="pl-pds">&#39;</span></span>).<span class="pl-en">info</span>(exchange, <span class="pl-s"><span class="pl-pds">&#39;</span>balance<span class="pl-pds">&#39;</span></span>.<span class="pl-smi">grey</span>, <span class="pl-en">n</span>(<span class="pl-smi">rs</span>.<span class="pl-smi">balance</span>[asset]).<span class="pl-en">format</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>0.000<span class="pl-pds">&#39;</span></span>).<span class="pl-smi">white</span>, <span class="pl-smi">asset</span>.<span class="pl-smi">grey</span>, <span class="pl-en">n</span>(<span class="pl-smi">rs</span>.<span class="pl-smi">balance</span>[currency]).<span class="pl-en">format</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>0.00<span class="pl-pds">&#39;</span></span>).<span class="pl-smi">yellow</span>, <span class="pl-smi">currency</span>.<span class="pl-smi">grey</span>, {feed<span class="pl-k">:</span> <span class="pl-s"><span class="pl-pds">&#39;</span>exchange<span class="pl-pds">&#39;</span></span>})</td>
      </tr>
      <tr>
        <td id="L128" class="blob-num js-line-number" data-line-number="128"></td>
        <td id="LC128" class="blob-code blob-code-inner js-file-line">          first_run <span class="pl-k">=</span> <span class="pl-c1">false</span></td>
      </tr>
      <tr>
        <td id="L129" class="blob-num js-line-number" data-line-number="129"></td>
        <td id="LC129" class="blob-code blob-code-inner js-file-line">          last_balance_sig <span class="pl-k">=</span> balance_sig</td>
      </tr>
      <tr>
        <td id="L130" class="blob-num js-line-number" data-line-number="130"></td>
        <td id="LC130" class="blob-code blob-code-inner js-file-line">        }</td>
      </tr>
      <tr>
        <td id="L131" class="blob-num js-line-number" data-line-number="131"></td>
        <td id="LC131" class="blob-code blob-code-inner js-file-line">        cb <span class="pl-k">&amp;&amp;</span> <span class="pl-en">cb</span>()</td>
      </tr>
      <tr>
        <td id="L132" class="blob-num js-line-number" data-line-number="132"></td>
        <td id="LC132" class="blob-code blob-code-inner js-file-line">      })</td>
      </tr>
      <tr>
        <td id="L133" class="blob-num js-line-number" data-line-number="133"></td>
        <td id="LC133" class="blob-code blob-code-inner js-file-line">    },</td>
      </tr>
      <tr>
        <td id="L134" class="blob-num js-line-number" data-line-number="134"></td>
        <td id="LC134" class="blob-code blob-code-inner js-file-line">    <span class="pl-k">function</span> (<span class="pl-smi">tick</span>, <span class="pl-smi">trigger</span>, <span class="pl-smi">rs</span>, <span class="pl-smi">cb</span>) {</td>
      </tr>
      <tr>
        <td id="L135" class="blob-num js-line-number" data-line-number="135"></td>
        <td id="LC135" class="blob-code blob-code-inner js-file-line">      <span class="pl-c">// note the last close price</span></td>
      </tr>
      <tr>
        <td id="L136" class="blob-num js-line-number" data-line-number="136"></td>
        <td id="LC136" class="blob-code blob-code-inner js-file-line">      <span class="pl-k">var</span> market_price <span class="pl-k">=</span> <span class="pl-en">o</span>(tick, selector <span class="pl-k">+</span> <span class="pl-s"><span class="pl-pds">&#39;</span>.close<span class="pl-pds">&#39;</span></span>)</td>
      </tr>
      <tr>
        <td id="L137" class="blob-num js-line-number" data-line-number="137"></td>
        <td id="LC137" class="blob-code blob-code-inner js-file-line">      <span class="pl-k">if</span> (market_price) {</td>
      </tr>
      <tr>
        <td id="L138" class="blob-num js-line-number" data-line-number="138"></td>
        <td id="LC138" class="blob-code blob-code-inner js-file-line">        <span class="pl-smi">rs</span>.<span class="pl-smi">market_price</span> <span class="pl-k">=</span> market_price</td>
      </tr>
      <tr>
        <td id="L139" class="blob-num js-line-number" data-line-number="139"></td>
        <td id="LC139" class="blob-code blob-code-inner js-file-line">      }</td>
      </tr>
      <tr>
        <td id="L140" class="blob-num js-line-number" data-line-number="140"></td>
        <td id="LC140" class="blob-code blob-code-inner js-file-line">      <span class="pl-k">if</span> (<span class="pl-k">!</span><span class="pl-smi">rs</span>.<span class="pl-smi">market_price</span>) <span class="pl-k">return</span> <span class="pl-en">cb</span>()</td>
      </tr>
      <tr>
        <td id="L141" class="blob-num js-line-number" data-line-number="141"></td>
        <td id="LC141" class="blob-code blob-code-inner js-file-line">      <span class="pl-k">if</span> (<span class="pl-k">!</span><span class="pl-smi">rs</span>.<span class="pl-smi">balance</span>) {</td>
      </tr>
      <tr>
        <td id="L142" class="blob-num js-line-number" data-line-number="142"></td>
        <td id="LC142" class="blob-code blob-code-inner js-file-line">        <span class="pl-c">// start with $1000, neutral position</span></td>
      </tr>
      <tr>
        <td id="L143" class="blob-num js-line-number" data-line-number="143"></td>
        <td id="LC143" class="blob-code blob-code-inner js-file-line">        <span class="pl-smi">rs</span>.<span class="pl-smi">balance</span> <span class="pl-k">=</span> {}</td>
      </tr>
      <tr>
        <td id="L144" class="blob-num js-line-number" data-line-number="144"></td>
        <td id="LC144" class="blob-code blob-code-inner js-file-line">        <span class="pl-smi">rs</span>.<span class="pl-smi">balance</span>[currency] <span class="pl-k">=</span> <span class="pl-c1">500</span></td>
      </tr>
      <tr>
        <td id="L145" class="blob-num js-line-number" data-line-number="145"></td>
        <td id="LC145" class="blob-code blob-code-inner js-file-line">        <span class="pl-smi">rs</span>.<span class="pl-smi">balance</span>[asset] <span class="pl-k">=</span> <span class="pl-en">n</span>(<span class="pl-c1">500</span>).<span class="pl-en">divide</span>(<span class="pl-smi">rs</span>.<span class="pl-smi">market_price</span>).<span class="pl-c1">value</span>()</td>
      </tr>
      <tr>
        <td id="L146" class="blob-num js-line-number" data-line-number="146"></td>
        <td id="LC146" class="blob-code blob-code-inner js-file-line">      }</td>
      </tr>
      <tr>
        <td id="L147" class="blob-num js-line-number" data-line-number="147"></td>
        <td id="LC147" class="blob-code blob-code-inner js-file-line">      <span class="pl-smi">rs</span>.<span class="pl-smi">ticks</span> <span class="pl-k">||</span> (<span class="pl-smi">rs</span>.<span class="pl-smi">ticks</span> <span class="pl-k">=</span> <span class="pl-c1">0</span>)</td>
      </tr>
      <tr>
        <td id="L148" class="blob-num js-line-number" data-line-number="148"></td>
        <td id="LC148" class="blob-code blob-code-inner js-file-line">      <span class="pl-smi">rs</span>.<span class="pl-smi">ticks</span><span class="pl-k">++</span></td>
      </tr>
      <tr>
        <td id="L149" class="blob-num js-line-number" data-line-number="149"></td>
        <td id="LC149" class="blob-code blob-code-inner js-file-line">      <span class="pl-k">if</span> (<span class="pl-smi">tick</span>.<span class="pl-c1">size</span> <span class="pl-k">!==</span> rsi_period) <span class="pl-k">return</span> <span class="pl-en">cb</span>()</td>
      </tr>
      <tr>
        <td id="L150" class="blob-num js-line-number" data-line-number="150"></td>
        <td id="LC150" class="blob-code blob-code-inner js-file-line">      <span class="pl-c">// get rsi</span></td>
      </tr>
      <tr>
        <td id="L151" class="blob-num js-line-number" data-line-number="151"></td>
        <td id="LC151" class="blob-code blob-code-inner js-file-line">      <span class="pl-k">var</span> rsi <span class="pl-k">=</span> <span class="pl-en">o</span>(tick, selector <span class="pl-k">+</span> <span class="pl-s"><span class="pl-pds">&#39;</span>.rsi<span class="pl-pds">&#39;</span></span>)</td>
      </tr>
      <tr>
        <td id="L152" class="blob-num js-line-number" data-line-number="152"></td>
        <td id="LC152" class="blob-code blob-code-inner js-file-line">      <span class="pl-c">// require minimum data</span></td>
      </tr>
      <tr>
        <td id="L153" class="blob-num js-line-number" data-line-number="153"></td>
        <td id="LC153" class="blob-code blob-code-inner js-file-line">      <span class="pl-c">// overbought/oversold</span></td>
      </tr>
      <tr>
        <td id="L154" class="blob-num js-line-number" data-line-number="154"></td>
        <td id="LC154" class="blob-code blob-code-inner js-file-line">      <span class="pl-c">// sanity check</span></td>
      </tr>
      <tr>
        <td id="L155" class="blob-num js-line-number" data-line-number="155"></td>
        <td id="LC155" class="blob-code blob-code-inner js-file-line">      <span class="pl-k">if</span> (rsi <span class="pl-k">&amp;&amp;</span> <span class="pl-smi">rsi</span>.<span class="pl-smi">samples</span> <span class="pl-k">&gt;=</span> <span class="pl-smi">c</span>.<span class="pl-smi">rsi_periods</span>) {</td>
      </tr>
      <tr>
        <td id="L156" class="blob-num js-line-number" data-line-number="156"></td>
        <td id="LC156" class="blob-code blob-code-inner js-file-line">        <span class="pl-smi">rs</span>.<span class="pl-smi">rsi</span> <span class="pl-k">=</span> <span class="pl-c1">Math</span>.<span class="pl-c1">round</span>(<span class="pl-smi">rsi</span>.<span class="pl-c1">value</span>)</td>
      </tr>
      <tr>
        <td id="L157" class="blob-num js-line-number" data-line-number="157"></td>
        <td id="LC157" class="blob-code blob-code-inner js-file-line">        <span class="pl-smi">rs</span>.<span class="pl-smi">rsi_ansi</span> <span class="pl-k">=</span> <span class="pl-smi">rsi</span>.<span class="pl-smi">ansi</span></td>
      </tr>
      <tr>
        <td id="L158" class="blob-num js-line-number" data-line-number="158"></td>
        <td id="LC158" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">if</span> (<span class="pl-smi">rsi</span>.<span class="pl-c1">value</span> <span class="pl-k">&gt;</span> <span class="pl-c1">70</span>) {</td>
      </tr>
      <tr>
        <td id="L159" class="blob-num js-line-number" data-line-number="159"></td>
        <td id="LC159" class="blob-code blob-code-inner js-file-line">          <span class="pl-smi">rs</span>.<span class="pl-smi">overbought</span> <span class="pl-k">=</span> <span class="pl-c1">true</span></td>
      </tr>
      <tr>
        <td id="L160" class="blob-num js-line-number" data-line-number="160"></td>
        <td id="LC160" class="blob-code blob-code-inner js-file-line">          <span class="pl-smi">rs</span>.<span class="pl-smi">oversold</span> <span class="pl-k">=</span> <span class="pl-c1">false</span></td>
      </tr>
      <tr>
        <td id="L161" class="blob-num js-line-number" data-line-number="161"></td>
        <td id="LC161" class="blob-code blob-code-inner js-file-line">        }</td>
      </tr>
      <tr>
        <td id="L162" class="blob-num js-line-number" data-line-number="162"></td>
        <td id="LC162" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">else</span> <span class="pl-k">if</span> (<span class="pl-smi">rsi</span>.<span class="pl-c1">value</span> <span class="pl-k">&lt;</span> <span class="pl-c1">30</span>) {</td>
      </tr>
      <tr>
        <td id="L163" class="blob-num js-line-number" data-line-number="163"></td>
        <td id="LC163" class="blob-code blob-code-inner js-file-line">          <span class="pl-smi">rs</span>.<span class="pl-smi">oversold</span> <span class="pl-k">=</span> <span class="pl-c1">true</span></td>
      </tr>
      <tr>
        <td id="L164" class="blob-num js-line-number" data-line-number="164"></td>
        <td id="LC164" class="blob-code blob-code-inner js-file-line">          <span class="pl-smi">rs</span>.<span class="pl-smi">overbought</span> <span class="pl-k">=</span> <span class="pl-c1">false</span></td>
      </tr>
      <tr>
        <td id="L165" class="blob-num js-line-number" data-line-number="165"></td>
        <td id="LC165" class="blob-code blob-code-inner js-file-line">        }</td>
      </tr>
      <tr>
        <td id="L166" class="blob-num js-line-number" data-line-number="166"></td>
        <td id="LC166" class="blob-code blob-code-inner js-file-line">      }</td>
      </tr>
      <tr>
        <td id="L167" class="blob-num js-line-number" data-line-number="167"></td>
        <td id="LC167" class="blob-code blob-code-inner js-file-line">      <span class="pl-en">cb</span>()</td>
      </tr>
      <tr>
        <td id="L168" class="blob-num js-line-number" data-line-number="168"></td>
        <td id="LC168" class="blob-code blob-code-inner js-file-line">    },</td>
      </tr>
      <tr>
        <td id="L169" class="blob-num js-line-number" data-line-number="169"></td>
        <td id="LC169" class="blob-code blob-code-inner js-file-line">    <span class="pl-c">// @todo MACD</span></td>
      </tr>
      <tr>
        <td id="L170" class="blob-num js-line-number" data-line-number="170"></td>
        <td id="LC170" class="blob-code blob-code-inner js-file-line">    <span class="pl-k">function</span> (<span class="pl-smi">tick</span>, <span class="pl-smi">trigger</span>, <span class="pl-smi">rs</span>, <span class="pl-smi">cb</span>) {</td>
      </tr>
      <tr>
        <td id="L171" class="blob-num js-line-number" data-line-number="171"></td>
        <td id="LC171" class="blob-code blob-code-inner js-file-line">      <span class="pl-en">cb</span>()</td>
      </tr>
      <tr>
        <td id="L172" class="blob-num js-line-number" data-line-number="172"></td>
        <td id="LC172" class="blob-code blob-code-inner js-file-line">    },</td>
      </tr>
      <tr>
        <td id="L173" class="blob-num js-line-number" data-line-number="173"></td>
        <td id="LC173" class="blob-code blob-code-inner js-file-line">    <span class="pl-c">// trigger trade signals</span></td>
      </tr>
      <tr>
        <td id="L174" class="blob-num js-line-number" data-line-number="174"></td>
        <td id="LC174" class="blob-code blob-code-inner js-file-line">    <span class="pl-k">function</span> (<span class="pl-smi">tick</span>, <span class="pl-smi">trigger</span>, <span class="pl-smi">rs</span>, <span class="pl-smi">cb</span>) {</td>
      </tr>
      <tr>
        <td id="L175" class="blob-num js-line-number" data-line-number="175"></td>
        <td id="LC175" class="blob-code blob-code-inner js-file-line">      <span class="pl-k">if</span> ((<span class="pl-smi">rs</span>.<span class="pl-smi">overbought</span> <span class="pl-k">||</span> <span class="pl-smi">rs</span>.<span class="pl-smi">oversold</span>) <span class="pl-k">&amp;&amp;</span> <span class="pl-smi">rs</span>.<span class="pl-smi">balance</span> <span class="pl-k">&amp;&amp;</span> <span class="pl-smi">rs</span>.<span class="pl-smi">market_price</span>) {</td>
      </tr>
      <tr>
        <td id="L176" class="blob-num js-line-number" data-line-number="176"></td>
        <td id="LC176" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">var</span> size, new_balance <span class="pl-k">=</span> {}</td>
      </tr>
      <tr>
        <td id="L177" class="blob-num js-line-number" data-line-number="177"></td>
        <td id="LC177" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">if</span> (<span class="pl-smi">rs</span>.<span class="pl-smi">overbought</span>) {</td>
      </tr>
      <tr>
        <td id="L178" class="blob-num js-line-number" data-line-number="178"></td>
        <td id="LC178" class="blob-code blob-code-inner js-file-line">          <span class="pl-en">get</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>logger<span class="pl-pds">&#39;</span></span>).<span class="pl-en">info</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>trader<span class="pl-pds">&#39;</span></span>, <span class="pl-s"><span class="pl-pds">&#39;</span>RSI:<span class="pl-pds">&#39;</span></span>.<span class="pl-smi">grey</span> <span class="pl-k">+</span> <span class="pl-smi">rs</span>.<span class="pl-smi">rsi_ansi</span>, <span class="pl-s"><span class="pl-pds">&#39;</span>anticipating a reversal DOWN. sell at market. (<span class="pl-pds">&#39;</span></span> <span class="pl-k">+</span> <span class="pl-en">format_currency</span>(<span class="pl-smi">rs</span>.<span class="pl-smi">market_price</span>, currency) <span class="pl-k">+</span> <span class="pl-s"><span class="pl-pds">&#39;</span>)<span class="pl-pds">&#39;</span></span>, {feed<span class="pl-k">:</span> <span class="pl-s"><span class="pl-pds">&#39;</span>trader<span class="pl-pds">&#39;</span></span>})</td>
      </tr>
      <tr>
        <td id="L179" class="blob-num js-line-number" data-line-number="179"></td>
        <td id="LC179" class="blob-code blob-code-inner js-file-line">          size <span class="pl-k">=</span> <span class="pl-smi">rs</span>.<span class="pl-smi">balance</span>[asset]</td>
      </tr>
      <tr>
        <td id="L180" class="blob-num js-line-number" data-line-number="180"></td>
        <td id="LC180" class="blob-code blob-code-inner js-file-line">        }</td>
      </tr>
      <tr>
        <td id="L181" class="blob-num js-line-number" data-line-number="181"></td>
        <td id="LC181" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">else</span> <span class="pl-k">if</span> (<span class="pl-smi">rs</span>.<span class="pl-smi">oversold</span>) {</td>
      </tr>
      <tr>
        <td id="L182" class="blob-num js-line-number" data-line-number="182"></td>
        <td id="LC182" class="blob-code blob-code-inner js-file-line">          <span class="pl-en">get</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>logger<span class="pl-pds">&#39;</span></span>).<span class="pl-en">info</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>trader<span class="pl-pds">&#39;</span></span>, <span class="pl-s"><span class="pl-pds">&#39;</span>RSI:<span class="pl-pds">&#39;</span></span>.<span class="pl-smi">grey</span> <span class="pl-k">+</span> <span class="pl-smi">rs</span>.<span class="pl-smi">rsi_ansi</span>, <span class="pl-s"><span class="pl-pds">&#39;</span>anticipating a reversal UP. buy at market. (<span class="pl-pds">&#39;</span></span> <span class="pl-k">+</span> <span class="pl-en">format_currency</span>(<span class="pl-smi">rs</span>.<span class="pl-smi">market_price</span>, currency) <span class="pl-k">+</span> <span class="pl-s"><span class="pl-pds">&#39;</span>)<span class="pl-pds">&#39;</span></span>, {feed<span class="pl-k">:</span> <span class="pl-s"><span class="pl-pds">&#39;</span>trader<span class="pl-pds">&#39;</span></span>})</td>
      </tr>
      <tr>
        <td id="L183" class="blob-num js-line-number" data-line-number="183"></td>
        <td id="LC183" class="blob-code blob-code-inner js-file-line">          size <span class="pl-k">=</span> <span class="pl-en">n</span>(<span class="pl-smi">rs</span>.<span class="pl-smi">balance</span>[currency]).<span class="pl-en">divide</span>(<span class="pl-smi">rs</span>.<span class="pl-smi">market_price</span>).<span class="pl-c1">value</span>()</td>
      </tr>
      <tr>
        <td id="L184" class="blob-num js-line-number" data-line-number="184"></td>
        <td id="LC184" class="blob-code blob-code-inner js-file-line">        }</td>
      </tr>
      <tr>
        <td id="L185" class="blob-num js-line-number" data-line-number="185"></td>
        <td id="LC185" class="blob-code blob-code-inner js-file-line">        <span class="pl-c">// scale down size a little, to prevent out-of-balance errors</span></td>
      </tr>
      <tr>
        <td id="L186" class="blob-num js-line-number" data-line-number="186"></td>
        <td id="LC186" class="blob-code blob-code-inner js-file-line">        size <span class="pl-k">=</span> <span class="pl-en">n</span>(size <span class="pl-k">||</span> <span class="pl-c1">0</span>).<span class="pl-en">multiply</span>(<span class="pl-c1">0.95</span>).<span class="pl-c1">value</span>()</td>
      </tr>
      <tr>
        <td id="L187" class="blob-num js-line-number" data-line-number="187"></td>
        <td id="LC187" class="blob-code blob-code-inner js-file-line">        <span class="pl-c">// min size</span></td>
      </tr>
      <tr>
        <td id="L188" class="blob-num js-line-number" data-line-number="188"></td>
        <td id="LC188" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">if</span> (<span class="pl-k">!</span>size <span class="pl-k">||</span> size <span class="pl-k">&lt;</span> <span class="pl-c1">0.01</span>) {</td>
      </tr>
      <tr>
        <td id="L189" class="blob-num js-line-number" data-line-number="189"></td>
        <td id="LC189" class="blob-code blob-code-inner js-file-line">          <span class="pl-k">if</span> (<span class="pl-smi">rs</span>.<span class="pl-smi">overbought</span>) {</td>
      </tr>
      <tr>
        <td id="L190" class="blob-num js-line-number" data-line-number="190"></td>
        <td id="LC190" class="blob-code blob-code-inner js-file-line">            <span class="pl-en">get</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>logger<span class="pl-pds">&#39;</span></span>).<span class="pl-en">info</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>trader<span class="pl-pds">&#39;</span></span>, <span class="pl-s"><span class="pl-pds">&#39;</span>RSI:<span class="pl-pds">&#39;</span></span>.<span class="pl-smi">grey</span> <span class="pl-k">+</span> <span class="pl-smi">rs</span>.<span class="pl-smi">rsi_ansi</span>, (<span class="pl-s"><span class="pl-pds">&#39;</span>not enough <span class="pl-pds">&#39;</span></span> <span class="pl-k">+</span> asset <span class="pl-k">+</span> <span class="pl-s"><span class="pl-pds">&#39;</span> to execute sell!<span class="pl-pds">&#39;</span></span>).<span class="pl-smi">red</span>, {feed<span class="pl-k">:</span> <span class="pl-s"><span class="pl-pds">&#39;</span>trader<span class="pl-pds">&#39;</span></span>})</td>
      </tr>
      <tr>
        <td id="L191" class="blob-num js-line-number" data-line-number="191"></td>
        <td id="LC191" class="blob-code blob-code-inner js-file-line">          }</td>
      </tr>
      <tr>
        <td id="L192" class="blob-num js-line-number" data-line-number="192"></td>
        <td id="LC192" class="blob-code blob-code-inner js-file-line">          <span class="pl-k">else</span> <span class="pl-k">if</span> (<span class="pl-smi">rs</span>.<span class="pl-smi">oversold</span>) {</td>
      </tr>
      <tr>
        <td id="L193" class="blob-num js-line-number" data-line-number="193"></td>
        <td id="LC193" class="blob-code blob-code-inner js-file-line">            <span class="pl-en">get</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>logger<span class="pl-pds">&#39;</span></span>).<span class="pl-en">info</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>trader<span class="pl-pds">&#39;</span></span>, <span class="pl-s"><span class="pl-pds">&#39;</span>RSI:<span class="pl-pds">&#39;</span></span>.<span class="pl-smi">grey</span> <span class="pl-k">+</span> <span class="pl-smi">rs</span>.<span class="pl-smi">rsi_ansi</span>, (<span class="pl-s"><span class="pl-pds">&#39;</span>not enough <span class="pl-pds">&#39;</span></span> <span class="pl-k">+</span> currency <span class="pl-k">+</span> <span class="pl-s"><span class="pl-pds">&#39;</span> to execute buy!<span class="pl-pds">&#39;</span></span>).<span class="pl-smi">red</span>, {feed<span class="pl-k">:</span> <span class="pl-s"><span class="pl-pds">&#39;</span>trader<span class="pl-pds">&#39;</span></span>})</td>
      </tr>
      <tr>
        <td id="L194" class="blob-num js-line-number" data-line-number="194"></td>
        <td id="LC194" class="blob-code blob-code-inner js-file-line">          }</td>
      </tr>
      <tr>
        <td id="L195" class="blob-num js-line-number" data-line-number="195"></td>
        <td id="LC195" class="blob-code blob-code-inner js-file-line">          <span class="pl-smi">rs</span>.<span class="pl-smi">overbought</span> <span class="pl-k">=</span> <span class="pl-smi">rs</span>.<span class="pl-smi">oversold</span> <span class="pl-k">=</span> <span class="pl-c1">false</span></td>
      </tr>
      <tr>
        <td id="L196" class="blob-num js-line-number" data-line-number="196"></td>
        <td id="LC196" class="blob-code blob-code-inner js-file-line">          <span class="pl-k">return</span> <span class="pl-en">cb</span>()</td>
      </tr>
      <tr>
        <td id="L197" class="blob-num js-line-number" data-line-number="197"></td>
        <td id="LC197" class="blob-code blob-code-inner js-file-line">        }</td>
      </tr>
      <tr>
        <td id="L198" class="blob-num js-line-number" data-line-number="198"></td>
        <td id="LC198" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">if</span> (<span class="pl-smi">rs</span>.<span class="pl-smi">overbought</span>) {</td>
      </tr>
      <tr>
        <td id="L199" class="blob-num js-line-number" data-line-number="199"></td>
        <td id="LC199" class="blob-code blob-code-inner js-file-line">          new_balance[currency] <span class="pl-k">=</span> <span class="pl-en">n</span>(<span class="pl-smi">rs</span>.<span class="pl-smi">balance</span>[currency]).<span class="pl-c1">add</span>(<span class="pl-en">n</span>(size).<span class="pl-en">multiply</span>(<span class="pl-smi">rs</span>.<span class="pl-smi">market_price</span>)).<span class="pl-c1">value</span>()</td>
      </tr>
      <tr>
        <td id="L200" class="blob-num js-line-number" data-line-number="200"></td>
        <td id="LC200" class="blob-code blob-code-inner js-file-line">          new_balance[asset] <span class="pl-k">=</span> <span class="pl-en">n</span>(<span class="pl-smi">rs</span>.<span class="pl-smi">balance</span>[asset]).<span class="pl-en">subtract</span>(size).<span class="pl-c1">value</span>()</td>
      </tr>
      <tr>
        <td id="L201" class="blob-num js-line-number" data-line-number="201"></td>
        <td id="LC201" class="blob-code blob-code-inner js-file-line">        }</td>
      </tr>
      <tr>
        <td id="L202" class="blob-num js-line-number" data-line-number="202"></td>
        <td id="LC202" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">else</span> <span class="pl-k">if</span> (<span class="pl-smi">rs</span>.<span class="pl-smi">oversold</span>) {</td>
      </tr>
      <tr>
        <td id="L203" class="blob-num js-line-number" data-line-number="203"></td>
        <td id="LC203" class="blob-code blob-code-inner js-file-line">          new_balance[asset] <span class="pl-k">=</span> <span class="pl-en">n</span>(<span class="pl-smi">rs</span>.<span class="pl-smi">balance</span>[asset]).<span class="pl-c1">add</span>(size).<span class="pl-c1">value</span>()</td>
      </tr>
      <tr>
        <td id="L204" class="blob-num js-line-number" data-line-number="204"></td>
        <td id="LC204" class="blob-code blob-code-inner js-file-line">          new_balance[currency] <span class="pl-k">=</span> <span class="pl-en">n</span>(<span class="pl-smi">rs</span>.<span class="pl-smi">balance</span>[currency]).<span class="pl-en">subtract</span>(<span class="pl-en">n</span>(size).<span class="pl-en">multiply</span>(<span class="pl-smi">rs</span>.<span class="pl-smi">market_price</span>)).<span class="pl-c1">value</span>()</td>
      </tr>
      <tr>
        <td id="L205" class="blob-num js-line-number" data-line-number="205"></td>
        <td id="LC205" class="blob-code blob-code-inner js-file-line">        }</td>
      </tr>
      <tr>
        <td id="L206" class="blob-num js-line-number" data-line-number="206"></td>
        <td id="LC206" class="blob-code blob-code-inner js-file-line">        <span class="pl-c">// consolidate balance</span></td>
      </tr>
      <tr>
        <td id="L207" class="blob-num js-line-number" data-line-number="207"></td>
        <td id="LC207" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">var</span> new_end_balance <span class="pl-k">=</span> <span class="pl-en">n</span>(new_balance[currency]).<span class="pl-c1">add</span>(<span class="pl-en">n</span>(new_balance[asset]).<span class="pl-en">multiply</span>(<span class="pl-smi">rs</span>.<span class="pl-smi">market_price</span>)).<span class="pl-c1">value</span>()</td>
      </tr>
      <tr>
        <td id="L208" class="blob-num js-line-number" data-line-number="208"></td>
        <td id="LC208" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">var</span> new_roi <span class="pl-k">=</span> <span class="pl-en">n</span>(new_end_balance).<span class="pl-en">divide</span>(<span class="pl-c1">1000</span>).<span class="pl-c1">value</span>()</td>
      </tr>
      <tr>
        <td id="L209" class="blob-num js-line-number" data-line-number="209"></td>
        <td id="LC209" class="blob-code blob-code-inner js-file-line">        <span class="pl-smi">rs</span>.<span class="pl-smi">balance</span> <span class="pl-k">=</span> new_balance</td>
      </tr>
      <tr>
        <td id="L210" class="blob-num js-line-number" data-line-number="210"></td>
        <td id="LC210" class="blob-code blob-code-inner js-file-line">        <span class="pl-smi">rs</span>.<span class="pl-smi">end_balance</span> <span class="pl-k">=</span> new_end_balance</td>
      </tr>
      <tr>
        <td id="L211" class="blob-num js-line-number" data-line-number="211"></td>
        <td id="LC211" class="blob-code blob-code-inner js-file-line">        <span class="pl-smi">rs</span>.<span class="pl-smi">roi</span> <span class="pl-k">=</span> new_roi</td>
      </tr>
      <tr>
        <td id="L212" class="blob-num js-line-number" data-line-number="212"></td>
        <td id="LC212" class="blob-code blob-code-inner js-file-line">        <span class="pl-smi">rs</span>.<span class="pl-smi">trades</span> <span class="pl-k">||</span> (<span class="pl-smi">rs</span>.<span class="pl-smi">trades</span> <span class="pl-k">=</span> <span class="pl-c1">0</span>)</td>
      </tr>
      <tr>
        <td id="L213" class="blob-num js-line-number" data-line-number="213"></td>
        <td id="LC213" class="blob-code blob-code-inner js-file-line">        <span class="pl-smi">rs</span>.<span class="pl-smi">trades</span><span class="pl-k">++</span></td>
      </tr>
      <tr>
        <td id="L214" class="blob-num js-line-number" data-line-number="214"></td>
        <td id="LC214" class="blob-code blob-code-inner js-file-line">        <span class="pl-en">trigger</span>({</td>
      </tr>
      <tr>
        <td id="L215" class="blob-num js-line-number" data-line-number="215"></td>
        <td id="LC215" class="blob-code blob-code-inner js-file-line">          type<span class="pl-k">:</span> <span class="pl-smi">rs</span>.<span class="pl-smi">overbought</span> <span class="pl-k">?</span> <span class="pl-s"><span class="pl-pds">&#39;</span>sell<span class="pl-pds">&#39;</span></span> <span class="pl-k">:</span> <span class="pl-s"><span class="pl-pds">&#39;</span>buy<span class="pl-pds">&#39;</span></span>,</td>
      </tr>
      <tr>
        <td id="L216" class="blob-num js-line-number" data-line-number="216"></td>
        <td id="LC216" class="blob-code blob-code-inner js-file-line">          asset<span class="pl-k">:</span> asset,</td>
      </tr>
      <tr>
        <td id="L217" class="blob-num js-line-number" data-line-number="217"></td>
        <td id="LC217" class="blob-code blob-code-inner js-file-line">          currency<span class="pl-k">:</span> currency,</td>
      </tr>
      <tr>
        <td id="L218" class="blob-num js-line-number" data-line-number="218"></td>
        <td id="LC218" class="blob-code blob-code-inner js-file-line">          exchange<span class="pl-k">:</span> exchange,</td>
      </tr>
      <tr>
        <td id="L219" class="blob-num js-line-number" data-line-number="219"></td>
        <td id="LC219" class="blob-code blob-code-inner js-file-line">          price<span class="pl-k">:</span> <span class="pl-smi">rs</span>.<span class="pl-smi">market_price</span>,</td>
      </tr>
      <tr>
        <td id="L220" class="blob-num js-line-number" data-line-number="220"></td>
        <td id="LC220" class="blob-code blob-code-inner js-file-line">          market<span class="pl-k">:</span> <span class="pl-c1">true</span>,</td>
      </tr>
      <tr>
        <td id="L221" class="blob-num js-line-number" data-line-number="221"></td>
        <td id="LC221" class="blob-code blob-code-inner js-file-line">          size<span class="pl-k">:</span> size,</td>
      </tr>
      <tr>
        <td id="L222" class="blob-num js-line-number" data-line-number="222"></td>
        <td id="LC222" class="blob-code blob-code-inner js-file-line">          rsi<span class="pl-k">:</span> <span class="pl-smi">rs</span>.<span class="pl-smi">rsi</span>,</td>
      </tr>
      <tr>
        <td id="L223" class="blob-num js-line-number" data-line-number="223"></td>
        <td id="LC223" class="blob-code blob-code-inner js-file-line">          roi<span class="pl-k">:</span> <span class="pl-smi">rs</span>.<span class="pl-smi">roi</span></td>
      </tr>
      <tr>
        <td id="L224" class="blob-num js-line-number" data-line-number="224"></td>
        <td id="LC224" class="blob-code blob-code-inner js-file-line">        })</td>
      </tr>
      <tr>
        <td id="L225" class="blob-num js-line-number" data-line-number="225"></td>
        <td id="LC225" class="blob-code blob-code-inner js-file-line">        <span class="pl-k">if</span> (<span class="pl-en">get</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>command<span class="pl-pds">&#39;</span></span>) <span class="pl-k">===</span> <span class="pl-s"><span class="pl-pds">&#39;</span>run<span class="pl-pds">&#39;</span></span> <span class="pl-k">&amp;&amp;</span> <span class="pl-smi">c</span>.<span class="pl-smi">key</span>) {</td>
      </tr>
      <tr>
        <td id="L226" class="blob-num js-line-number" data-line-number="226"></td>
        <td id="LC226" class="blob-code blob-code-inner js-file-line">          <span class="pl-k">var</span> params <span class="pl-k">=</span> {</td>
      </tr>
      <tr>
        <td id="L227" class="blob-num js-line-number" data-line-number="227"></td>
        <td id="LC227" class="blob-code blob-code-inner js-file-line">            type<span class="pl-k">:</span> <span class="pl-s"><span class="pl-pds">&#39;</span>market<span class="pl-pds">&#39;</span></span>,</td>
      </tr>
      <tr>
        <td id="L228" class="blob-num js-line-number" data-line-number="228"></td>
        <td id="LC228" class="blob-code blob-code-inner js-file-line">            size<span class="pl-k">:</span> <span class="pl-en">n</span>(size).<span class="pl-en">format</span>(<span class="pl-s"><span class="pl-pds">&#39;</span>0.000000<span class="pl-pds">&#39;</span></span>),</td>
      </tr>
      <tr>
        <td id="L229" class="blob-num js-line-number" data-line-number="229"></td>
        <td id="LC229" class="blob-code blob-code-inner js-file-line">            product_id<span class="pl-k">:</span> asset <span class="pl-k">+</span> <span class="pl-s"><span class="pl-pds">&#39;</span>-<span class="pl-pds">&#39;</span></span> <span class="pl-k">+</span> currency</td>
      </tr>
      <tr>
        <td id="L230" class="blob-num js-line-number" data-line-number="230"></td>
        <td id="LC230" class="blob-code blob-code-inner js-file-line">          }</td>
      </tr>
      <tr>
        <td id="L231" class="blob-num js-line-number" data-line-number="231"></td>
        <td id="LC231" class="blob-code blob-code-inner js-file-line">          client[<span class="pl-smi">rs</span>.<span class="pl-smi">overbought</span> <span class="pl-k">?</span> <span class="pl-s"><span class="pl-pds">&#39;</span>sell<span class="pl-pds">&#39;</span></span> <span class="pl-k">:</span> <span class="pl-s"><span class="pl-pds">&#39;</span>buy<span class="pl-pds">&#39;</span></span>](params, <span class="pl-k">function</span> (<span class="pl-smi">err</span>, <span class="pl-smi">resp</span>, <span class="pl-smi">order</span>) {</td>
      </tr>
      <tr>
        <td id="L232" class="blob-num js-line-number" data-line-number="232"></td>
        <td id="LC232" class="blob-code blob-code-inner js-file-line">            <span class="pl-en">onOrder</span>(err, resp, order)</td>
      </tr>
      <tr>
        <td id="L233" class="blob-num js-line-number" data-line-number="233"></td>
        <td id="LC233" class="blob-code blob-code-inner js-file-line">          })</td>
      </tr>
      <tr>
        <td id="L234" class="blob-num js-line-number" data-line-number="234"></td>
        <td id="LC234" class="blob-code blob-code-inner js-file-line">        }</td>
      </tr>
      <tr>
        <td id="L235" class="blob-num js-line-number" data-line-number="235"></td>
        <td id="LC235" class="blob-code blob-code-inner js-file-line">        <span class="pl-smi">rs</span>.<span class="pl-smi">overbought</span> <span class="pl-k">=</span> <span class="pl-smi">rs</span>.<span class="pl-smi">oversold</span> <span class="pl-k">=</span> <span class="pl-c1">false</span></td>
      </tr>
      <tr>
        <td id="L236" class="blob-num js-line-number" data-line-number="236"></td>
        <td id="LC236" class="blob-code blob-code-inner js-file-line">      }</td>
      </tr>
      <tr>
        <td id="L237" class="blob-num js-line-number" data-line-number="237"></td>
        <td id="LC237" class="blob-code blob-code-inner js-file-line">      <span class="pl-en">cb</span>()</td>
      </tr>
      <tr>
        <td id="L238" class="blob-num js-line-number" data-line-number="238"></td>
        <td id="LC238" class="blob-code blob-code-inner js-file-line">    }</td>
      </tr>
      <tr>
        <td id="L239" class="blob-num js-line-number" data-line-number="239"></td>
        <td id="LC239" class="blob-code blob-code-inner js-file-line">    <span class="pl-c">// END DEFAULT TRADE LOGIC</span></td>
      </tr>
      <tr>
        <td id="L240" class="blob-num js-line-number" data-line-number="240"></td>
        <td id="LC240" class="blob-code blob-code-inner js-file-line">  ]</td>
      </tr>
      <tr>
        <td id="L241" class="blob-num js-line-number" data-line-number="241"></td>
        <td id="LC241" class="blob-code blob-code-inner js-file-line">}</td>
      </tr>
      <tr>
        <td id="L242" class="blob-num js-line-number" data-line-number="242"></td>
        <td id="LC242" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">reporter_sizes</span> <span class="pl-k">=</span> [<span class="pl-s"><span class="pl-pds">&#39;</span>1m<span class="pl-pds">&#39;</span></span>, <span class="pl-s"><span class="pl-pds">&#39;</span>15m<span class="pl-pds">&#39;</span></span>, <span class="pl-s"><span class="pl-pds">&#39;</span>1h<span class="pl-pds">&#39;</span></span>, <span class="pl-s"><span class="pl-pds">&#39;</span>6h<span class="pl-pds">&#39;</span></span>]</td>
      </tr>
      <tr>
        <td id="L243" class="blob-num js-line-number" data-line-number="243"></td>
        <td id="LC243" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">price_reporter_selector</span> <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&quot;</span>gdax.BTC-USD<span class="pl-pds">&quot;</span></span></td>
      </tr>
      <tr>
        <td id="L244" class="blob-num js-line-number" data-line-number="244"></td>
        <td id="LC244" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">price_reporter_length</span> <span class="pl-k">=</span> <span class="pl-c1">9</span></td>
      </tr>
      <tr>
        <td id="L245" class="blob-num js-line-number" data-line-number="245"></td>
        <td id="LC245" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">reporter_cols</span> <span class="pl-k">=</span> [</td>
      </tr>
      <tr>
        <td id="L246" class="blob-num js-line-number" data-line-number="246"></td>
        <td id="LC246" class="blob-code blob-code-inner js-file-line">  <span class="pl-s"><span class="pl-pds">&quot;</span>tick_id<span class="pl-pds">&quot;</span></span>,</td>
      </tr>
      <tr>
        <td id="L247" class="blob-num js-line-number" data-line-number="247"></td>
        <td id="LC247" class="blob-code blob-code-inner js-file-line">  <span class="pl-s"><span class="pl-pds">&quot;</span>num_trades<span class="pl-pds">&quot;</span></span>,</td>
      </tr>
      <tr>
        <td id="L248" class="blob-num js-line-number" data-line-number="248"></td>
        <td id="LC248" class="blob-code blob-code-inner js-file-line">  <span class="pl-s"><span class="pl-pds">&quot;</span>timestamp<span class="pl-pds">&quot;</span></span>,</td>
      </tr>
      <tr>
        <td id="L249" class="blob-num js-line-number" data-line-number="249"></td>
        <td id="LC249" class="blob-code blob-code-inner js-file-line">  <span class="pl-s"><span class="pl-pds">&quot;</span>rsi<span class="pl-pds">&quot;</span></span>,</td>
      </tr>
      <tr>
        <td id="L250" class="blob-num js-line-number" data-line-number="250"></td>
        <td id="LC250" class="blob-code blob-code-inner js-file-line">  <span class="pl-s"><span class="pl-pds">&quot;</span>volume<span class="pl-pds">&quot;</span></span>,</td>
      </tr>
      <tr>
        <td id="L251" class="blob-num js-line-number" data-line-number="251"></td>
        <td id="LC251" class="blob-code blob-code-inner js-file-line">  <span class="pl-s"><span class="pl-pds">&quot;</span>price<span class="pl-pds">&quot;</span></span></td>
      </tr>
      <tr>
        <td id="L252" class="blob-num js-line-number" data-line-number="252"></td>
        <td id="LC252" class="blob-code blob-code-inner js-file-line">]</td>
      </tr>
      <tr>
        <td id="L253" class="blob-num js-line-number" data-line-number="253"></td>
        <td id="LC253" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">backfill_days</span> <span class="pl-k">=</span> <span class="pl-c1">91</span></td>
      </tr>
      <tr>
        <td id="L254" class="blob-num js-line-number" data-line-number="254"></td>
        <td id="LC254" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">record_timeout</span> <span class="pl-k">=</span> <span class="pl-c1">20000</span></td>
      </tr>
      <tr>
        <td id="L255" class="blob-num js-line-number" data-line-number="255"></td>
        <td id="LC255" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">backfill_timeout</span> <span class="pl-k">=</span> <span class="pl-c1">5000</span></td>
      </tr>
      <tr>
        <td id="L256" class="blob-num js-line-number" data-line-number="256"></td>
        <td id="LC256" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">reducer_report_interval</span> <span class="pl-k">=</span> <span class="pl-c1">2000</span></td>
      </tr>
      <tr>
        <td id="L257" class="blob-num js-line-number" data-line-number="257"></td>
        <td id="LC257" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">trade_report_interval</span> <span class="pl-k">=</span> <span class="pl-c1">10000</span></td>
      </tr>
      <tr>
        <td id="L258" class="blob-num js-line-number" data-line-number="258"></td>
        <td id="LC258" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">sim_input_unit</span> <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&quot;</span>7d<span class="pl-pds">&quot;</span></span></td>
      </tr>
      <tr>
        <td id="L259" class="blob-num js-line-number" data-line-number="259"></td>
        <td id="LC259" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">sim_input_limit</span> <span class="pl-k">=</span> <span class="pl-c1">12</span></td>
      </tr>
      <tr>
        <td id="L260" class="blob-num js-line-number" data-line-number="260"></td>
        <td id="LC260" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">log_query_limit</span> <span class="pl-k">=</span> <span class="pl-c1">200</span></td>
      </tr>
      <tr>
        <td id="L261" class="blob-num js-line-number" data-line-number="261"></td>
        <td id="LC261" class="blob-code blob-code-inner js-file-line"><span class="pl-smi">c</span>.<span class="pl-smi">tracking_scripts</span> <span class="pl-k">=</span> <span class="pl-s"><span class="pl-pds">&#39;</span><span class="pl-pds">&#39;</span></span></td>
      </tr>
      <tr>
        <td id="L262" class="blob-num js-line-number" data-line-number="262"></td>
        <td id="LC262" class="blob-code blob-code-inner js-file-line">
</td>
      </tr>
</table>

  </div>

</div>

<button type="button" data-facebox="#jump-to-line" data-facebox-class="linejump" data-hotkey="l" class="hidden">Jump to Line</button>
<div id="jump-to-line" style="display:none">
  <!-- </textarea> --><!-- '"` --><form accept-charset="UTF-8" action="" class="js-jump-to-line-form" method="get"><div style="margin:0;padding:0;display:inline"><input name="utf8" type="hidden" value="&#x2713;" /></div>
    <input class="form-control linejump-input js-jump-to-line-field" type="text" placeholder="Jump to line&hellip;" aria-label="Jump to line" autofocus>
    <button type="submit" class="btn">Go</button>
</form></div>

  </div>
  <div class="modal-backdrop js-touch-events"></div>
</div>


    </div>
  </div>

    </div>

        <div class="container site-footer-container">
  <div class="site-footer" role="contentinfo">
    <ul class="site-footer-links right">
        <li><a href="https://github.com/contact" data-ga-click="Footer, go to contact, text:contact">Contact GitHub</a></li>
      <li><a href="https://developer.github.com" data-ga-click="Footer, go to api, text:api">API</a></li>
      <li><a href="https://training.github.com" data-ga-click="Footer, go to training, text:training">Training</a></li>
      <li><a href="https://shop.github.com" data-ga-click="Footer, go to shop, text:shop">Shop</a></li>
        <li><a href="https://github.com/blog" data-ga-click="Footer, go to blog, text:blog">Blog</a></li>
        <li><a href="https://github.com/about" data-ga-click="Footer, go to about, text:about">About</a></li>

    </ul>

    <a href="https://github.com" aria-label="Homepage" class="site-footer-mark" title="GitHub">
      <svg aria-hidden="true" class="octicon octicon-mark-github" height="24" version="1.1" viewBox="0 0 16 16" width="24"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>
</a>
    <ul class="site-footer-links">
      <li>&copy; 2016 <span title="0.04723s from github-fe136-cp1-prd.iad.github.net">GitHub</span>, Inc.</li>
        <li><a href="https://github.com/site/terms" data-ga-click="Footer, go to terms, text:terms">Terms</a></li>
        <li><a href="https://github.com/site/privacy" data-ga-click="Footer, go to privacy, text:privacy">Privacy</a></li>
        <li><a href="https://github.com/security" data-ga-click="Footer, go to security, text:security">Security</a></li>
        <li><a href="https://status.github.com/" data-ga-click="Footer, go to status, text:status">Status</a></li>
        <li><a href="https://help.github.com" data-ga-click="Footer, go to help, text:help">Help</a></li>
    </ul>
  </div>
</div>



    

    <div id="ajax-error-message" class="ajax-error-message flash flash-error">
      <svg aria-hidden="true" class="octicon octicon-alert" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path d="M8.865 1.52c-.18-.31-.51-.5-.87-.5s-.69.19-.87.5L.275 13.5c-.18.31-.18.69 0 1 .19.31.52.5.87.5h13.7c.36 0 .69-.19.86-.5.17-.31.18-.69.01-1L8.865 1.52zM8.995 13h-2v-2h2v2zm0-3h-2V6h2v4z"></path></svg>
      <button type="button" class="flash-close js-flash-close js-ajax-error-dismiss" aria-label="Dismiss error">
        <svg aria-hidden="true" class="octicon octicon-x" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z"></path></svg>
      </button>
      You can't perform that action at this time.
    </div>


      <script crossorigin="anonymous" src="https://assets-cdn.github.com/assets/compat-40e365359d1c4db1e36a55be458e60f2b7c24d58b5a00ae13398480e7ba768e0.js"></script>
      <script crossorigin="anonymous" src="https://assets-cdn.github.com/assets/frameworks-e473d5424fface697be40bd46eb877027b3ecdc58f266fed330b402413df30d5.js"></script>
      <script async="async" crossorigin="anonymous" src="https://assets-cdn.github.com/assets/github-5a05539a2ab04f10abd2879546db58882d74e2789b0164a23ac4bfdb431a461f.js"></script>
      
      
      
      
      
      
    <div class="js-stale-session-flash stale-session-flash flash flash-warn flash-banner hidden">
      <svg aria-hidden="true" class="octicon octicon-alert" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path d="M8.865 1.52c-.18-.31-.51-.5-.87-.5s-.69.19-.87.5L.275 13.5c-.18.31-.18.69 0 1 .19.31.52.5.87.5h13.7c.36 0 .69-.19.86-.5.17-.31.18-.69.01-1L8.865 1.52zM8.995 13h-2v-2h2v2zm0-3h-2V6h2v4z"></path></svg>
      <span class="signed-in-tab-flash">You signed in with another tab or window. <a href="">Reload</a> to refresh your session.</span>
      <span class="signed-out-tab-flash">You signed out in another tab or window. <a href="">Reload</a> to refresh your session.</span>
    </div>
    <div class="facebox" id="facebox" style="display:none;">
  <div class="facebox-popup">
    <div class="facebox-content" role="dialog" aria-labelledby="facebox-header" aria-describedby="facebox-description">
    </div>
    <button type="button" class="facebox-close js-facebox-close" aria-label="Close modal">
      <svg aria-hidden="true" class="octicon octicon-x" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z"></path></svg>
    </button>
  </div>
</div>

  </body>
</html>

