#HSLIDE

## Zenbot 3
##### <span style="font-family:Helvetica Neue; font-weight:bold">A lightweight, <span style="color:#e49436">artificially intelligent</span> trading bot</span>

#HSLIDE
## Slideshow Theme Switcher
<span style="font-size:0.6em; color:gray">Available bottom-left of screen.</span> |
<span style="font-size:0.6em; color:gray">Start switching themes right now!</span>

#HSLIDE

## Tip!
For best viewing experience press **F** key to go fullscreen.

![zenbot logo](https://rawgit.com/carlos8f/zenbot/master/assets/zenbot_3_logo.png)

> “To follow the path, look to the master, follow the master, walk with the master, see through the master, become the master.”
> – Zen Proverb

#HSLIDE

Zenbot is a lightweight, extendable, artificially intelligent trading bot. Currently Zenbot is capable of:

- High-frequency trading, day trading, week trading
- Multiple asset support for Bitcoin, Ether, Litecoin (and more)
- Multiple currency support for US Dollars, Euros, Chinese Yuan (and more)
- Multiple exchange support for Bitfinex, GDAX, Kraken, Poloniex (and more)

#HSLIDE

- Realtime consuming and analysis of trade data
- Simulating your trade strategy using the historical data
- Outputting data as CSV, JSON, or candlestick graph

#HSLIDE

Current simulations on historical data from May - August 2016 show Zenbot 3.2.3 [**DOUBLING its investment**](https://gist.github.com/carlos8f/54c7afd4c9300ad9ea9cbccb294faebd) in only 12 weeks, using default parameters!

#HSLIDE

# _"Zenbot, you're a genius!"_

> Yes I am!

HOWEVER. BE AWARE that once you hook up Zenbot to a live exchange, the damage done is your fault, not mine! **As with buying crypto currency in general, risk is involved and caution is essential. Crypto currency is an experiment, and so is Zenbot.**

#HSLIDE

# Features

- A powerful map/reduce system to live-process data at scale.
- A plugin system to facilitate incremental support for any exchange, currency pair, trade strategy, or reporting medium.
- Out of the box, Zenbot is an AI-powered trade advisor (gives you buy or sell signals while watching live data).
- Default support for [GDAX](https://gdax.com/) is included, so if you have a GDAX account, enable bot trades by simply putting your GDAX API key in `config.js` and setting what currency pair to trade.

#HSLIDE

- Default support for other exchanges is ongoing.
- Trade strategy is fully exposed in the config file. This allows you to have full control over the bot's actions and logic. For example, instead of trading on GDAX, you could trade on a different exchange or currency pair by implementing a few lines of JavaScript.
- A live candlestick graph is provided via a built-in HTTP server.

#HSLIDE

In the next screenshot, the pink arrows represent the bot buying (up arrow) and selling (down arrow) as it iterated the historical data of [GDAX](https://gdax.com/) exchange's BTC/USD product. The simulation iterated 12 weeks of data and ended with 198% balance, an unbelieveable 90% [ROI](https://en.wikipedia.org/wiki/Return_on_investment).

#HSLIDE

![screenshot](https://cloud.githubusercontent.com/assets/106763/17820631/94c99a20-6602-11e6-8175-39b71c6a085e.png)

#HSLIDE

## Quick-start

### 1. Requirements: [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/download-center)

#HSLIDE

### 2. Install zenbot 3:

```
git clone https://github.com/carlos8f/zenbot.git
cd zenbot
npm install
```

#HSLIDE

### 3. Edit `config.js` with API keys, database credentials, trade logic, etc.

#HSLIDE

### 4. Run zenbot:

```
./run.sh
```

#HSLIDE

### 5. Open the live graph URL provided in the console.

#HSLIDE

### 6. Simulation

Once backfill has finished, run a simulation:

```
zenbot sim [--verbose]
```

- Zenbot will return you a list of virtual trades, and an ROI figure.
- Open the URL provided in the console (while running the server) to see the virtual trades plotted on a candlestick graph.
- Tweak `config.js` for new trade strategies and check your results this way.

#HSLIDE

### Default trade logic

- uses [GDAX](https://gdax.com/) API
- watches BTC/USD
- acts at 1m increments (ticks), but you can configure to act quicker or slower.
- computes the latest 14-hour [RSI](http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:relative_strength_index_rsi)

#HSLIDE

#### Default logic cont'd.

- considers `RSI >= 70` an upwards trend and `RSI <= 30` a downwards trend
- Buys at the beginning of upwards trend, sells at the beginning of downwards trend
- trades 95% of current balance, market price

#HSLIDE

- Holds for min. 100 minutes after a trade
- You can tweak the JS from there to use bitfinex, or trade ETH, or whatever.
- After tweaking `default_logic.js`, Use `zenbot sim` to check your strategy against historical trades.

#HSLIDE

### 7. Web console

When the server is running, and you have visited the `?secret` URL provided in the console, you can access an aggregated, live feed of log messages at `http://localhost:3013/logs`. Example:

![screenshot](https://raw.githubusercontent.com/carlos8f/zenbot/master/assets/zenbot_web_logs.png)

## How does it work?

#HSLIDE

_It's a Neural Network!_

#HSLIDE

- Artificial Neural Networks (ANNs) are a type of Universal Function Approximator (UFA).
- Given the right data and configured correctly, they can capture and model any input-output relationships.
- This removes the need for human interpretation of charts to determine entry/exit signals.
- Zenbot creates and maintains its own Neural Network in MongoDB to power its financial analysis.

#HSLIDE

## General facts about ANN trading

- ANN's can be both mathematically and empirically tested using simulations.
- In various studies, authors have claimed that neural networks used for generating trading signals given various technical and fundamental inputs.
- ANN's significantly outperformed buy-hold strategies as well as traditional linear technical analysis methods when combined with rule-based expert systems.

#HSLIDE

- ANN's have, in the past, been used only in the circles of scientific researchers.
- ANN's are just now becoming available for use in trading.

Source: [Wikipedia](https://en.wikipedia.org/wiki/Technical_analysis#Systematic_trading)

#HSLIDE

## Zenbot has a plugin system

Note that simulations always end on Wednesday 5pm PST, and run for a max 84 days (12 weeks), to ensure input consistency.

Auto-learn support and more exchange support will come soon. Will accept PR's :) With the 3.x plugin architecture, external plugins are possible too (published as their own repo/module).

## Donate

P.S., some have asked for how to donate to Zenbot development. I accept donations at **my Bitcoin address** Here:

![zenbot logo](https://s8f.org/files/bitcoin.png)

#HSLIDE

## ACTIVE development happening!

Zenbot is deployed as my personal trading bot. I update it regularly, as I improve the engine.

#HSLIDE

## Zenbot is on the web!

- Follow Zenbot [on Twitter!](https://twitter.com/zenbot_btc)
- Check out Zenbot's [live feed!](https://zenbot.s8f.org/)
- Join the discussion on [Reddit!](https://www.reddit.com/r/Bitcoin/comments/4xqo8q/announcing_zenbot_3_your_new_btcethltc_trading/)!




#VSLIDE?gist=8da53731fd54bab9d5c6

#VSLIDE?gist=28ee3d19ddef9d51b15adbdfe9ed48da

#HSLIDE

## Image Slides
## [ Inline ]
<span style="font-size:0.6em; color:gray">See slides below for examples.</span> |
<span style="font-size:0.6em; color:gray">See <a href="https://github.com/gitpitch/gitpitch/wiki/Image-Slides" target="_blank">GitPitch Wiki</a> for details.</span>

#VSLIDE

#### Make A Visual Statement

<br>

Use inline images to lend a *visual punch* to your slideshow presentations.


#VSLIDE

<span style="color:gray; font-size:0.7em">Inline Image at <b>Absolute URL</b></span>

![Image-Absolute](https://res.cloudinary.com/gitpitch/raw/upload/kitchen-sink/octocat-privateinvestocat.jpg)

<span style="color:gray; font-size: 0.5em;">the <b>Private Investocat</b> by <a href="https://github.com/jeejkang" target="_blank">jeejkang</a></span>


#VSLIDE

<span style="color:gray; font-size:0.7em">Inline Image at GitHub Repo <b>Relative URL</b></span>

![Image-Absolute](assets/octocat-de-los-muertos.jpg)

<span style="color:gray; font-size:0.5em">the <b>Octocat-De-Los-Muertos</b> by <a href="https://github.com/cameronmcefee" target="_blank">cameronmcefee</a></span>


#VSLIDE

<span style="color:gray; font-size:0.7em"><b>Animated GIFs</b> Work Too!</span>

![Image-Relative](https://res.cloudinary.com/gitpitch/raw/upload/kitchen-sink/octocat-daftpunkocat.gif)

<span style="color:gray; font-size:0.5em">the <b>Daftpunktocat-Guy</b> by <a href="https://github.com/jeejkang" target="_blank">jeejkang</a></span>

#HSLIDE

## Image Slides
## [ Background ]
<span style="font-size:0.6em; color:gray">See slides below for examples.</span> |
<span style="font-size:0.6em; color:gray">See <a href="https://github.com/gitpitch/gitpitch/wiki/Image-Slides#background" target="_blank">GitPitch Wiki</a> for details.</span>

#VSLIDE

#### Make A Bold Visual Statement

<br>

Use high-resolution background images for maximum impact.

#VSLIDE?image=https://res.cloudinary.com/gitpitch/raw/upload/kitchen-sink/victory.jpg

#VSLIDE?image=https://res.cloudinary.com/gitpitch/raw/upload/kitchen-sink/127.jpg


#HSLIDE

## Video Slides
## [ Inline ]
<span style="font-size:0.6em; color:gray">See slides below for examples.</span> |
<span style="font-size:0.6em; color:gray">See <a href="https://github.com/gitpitch/gitpitch/wiki/Video-Slides" target="_blank">GitPitch Wiki</a> for details.</span>

#VSLIDE

#### Bring Your Presentations Alive

<br>

Embed *YouTube*, *Vimeo*, *MP4* and *WebM* inline on any slide.

#VSLIDE

![YouTube Video](https://www.youtube.com/embed/mkiDkkdGGAQ)

#VSLIDE

![Vimeo Video](https://player.vimeo.com/video/111525512)

#VSLIDE

![MP4 Video](http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4)


#HSLIDE

## Video Slides
## [ Background ]
<span style="font-size:0.6em; color:gray">See slides below for examples.</span> |
<span style="font-size:0.6em; color:gray">See <a href="https://github.com/gitpitch/gitpitch/wiki/Video-Slides#background" target="_blank">GitPitch Wiki</a> for details.</span>

#VSLIDE

#### Maximize The Viewer Experience

<br>

Go fullscreen with *MP4* and *WebM* videos.

#VSLIDE?video=http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4

#HSLIDE

## Math Notation Slides
<span style="font-size:0.6em; color:gray">See slides below for examples.</span> |
<span style="font-size:0.6em; color:gray">See <a href="https://github.com/gitpitch/gitpitch/wiki/Math-Notation-Slides" target="_blank">GitPitch Wiki</a> for details.</span>

#VSLIDE


#### Beautiful Math Rendered Beautifully

<br>

Use *TeX*, *LaTeX* and *MathML* markup powered by <a target="_blank" href="https://www.mathjax.org/">MathJax</a>.

#VSLIDE

`$$\sum_{i=0}^n i^2 = \frac{(n^2+n)(2n+1)}{6}$$`

#VSLIDE

`$$\begin{array}{c|lcr} n & \text{Left} & \text{Center} & \text{Right} \\ \hline 1 & 0.24 & 1 & 125 \\ 2 & -1 & 189 & -8 \\ 3 & -20 & 2000 & 1+10i \end{array}$$`

#VSLIDE

`\begin{align}
\dot{x} & = \sigma(y-x) \\
\dot{y} & = \rho x - y - xz \\
\dot{z} & = -\beta z + xy
\end{align}`

#VSLIDE

##### The Cauchy-Schwarz Inequality

`\[
\left( \sum_{k=1}^n a_k b_k \right)^{\!\!2} \leq
 \left( \sum_{k=1}^n a_k^2 \right) \left( \sum_{k=1}^n b_k^2 \right)
\]`

#VSLIDE

##### A Cross Product Formula

`\[
  \mathbf{V}_1 \times \mathbf{V}_2 =
   \begin{vmatrix}
    \mathbf{i} & \mathbf{j} & \mathbf{k} \\
    \frac{\partial X}{\partial u} & \frac{\partial Y}{\partial u} & 0 \\
    \frac{\partial X}{\partial v} & \frac{\partial Y}{\partial v} & 0 \\
   \end{vmatrix}
\]`

#VSLIDE

##### The probability of getting \(k\) heads when flipping \(n\) coins is:

`\[P(E) = {n \choose k} p^k (1-p)^{ n-k} \]`

#VSLIDE

##### In-line Mathematics

This expression `\(\sqrt{3x-1}+(1+x)^2\)` is an example of an inline equation.  As
you see, MathJax equations can be used without unduly disturbing the spacing between lines.

#HSLIDE

## Slide Fragments
<span style="font-size:0.6em; color:gray">See slides below for examples.</span> |
<span style="font-size:0.6em; color:gray">See <a href="https://github.com/gitpitch/gitpitch/wiki/Fragment-Slides" target="_blank">GitPitch Wiki</a> for details.</span>

#VSLIDE

#### Reveal Slide Concepts Piecemeal

<br>

Step through slide content in sequence to slowly reveal the bigger picture.

#VSLIDE

- Java
- Groovy     <!-- .element: class="fragment" -->
- Kotlin     <!-- .element: class="fragment" -->
- Scala     <!-- .element: class="fragment" -->
- The JVM rocks! <!-- .element: class="fragment" -->

#VSLIDE

<table>
  <tr>
    <th>Firstname</th>
    <th>Lastname</th> 
    <th>Age</th>
  </tr>
  <tr>
    <td>Jill</td>
    <td>Smith</td>
    <td>50</td>
  </tr>
  <tr class="fragment">
    <td>Eve</td>
    <td>Jackson</td>
    <td>94</td>
  </tr>
  <tr class="fragment">
    <td>John</td>
    <td>Doe</td>
    <td>80</td>
  </tr>
</table>

#HSLIDE
## <span style="text-transform: none">PITCHME.yaml</span> Settings
<span style="font-size:0.6em; color:gray">See slides below for examples.</span> |
<span style="font-size:0.6em; color:gray">See <a href="https://github.com/gitpitch/gitpitch/wiki/Slideshow-Settings" target="_blank">GitPitch Wiki</a> for details.</span>

#VSLIDE

#### Stamp Your Own Look and Feel

<br>

Set a default theme, custom logo, background image, and preferred code syntax highlighting style.

#VSLIDE

#### Customize Slideshow Behavior

<br>

Enable auto-slide with custom intervals, looping, and RTL.


#HSLIDE
## Slideshow Keyboard Controls
<span style="font-size:0.6em; color:gray">See slides below for examples.</span> |
<span style="font-size:0.6em; color:gray">See <a href="https://github.com/gitpitch/gitpitch/wiki/Slideshow-Fullscreen-Mode" target="_blank">GitPitch Wiki</a> for details.</span>

#VSLIDE

#### Try Out These Great Features Now!

<br>

| Mode | On Key | Off Key |
| ---- | :------: | :--------: |
| Fullscreen | F |  Esc |
| Overview | O |  O |
| Blackout | B |  B |
| Help | ? |  Esc |


#HSLIDE

## GitPitch Social
<span style="font-size:0.6em; color:gray">See slides below for examples.</span> |
<span style="font-size:0.6em; color:gray">See <a href="https://github.com/gitpitch/gitpitch/wiki/Slideshow-GitHub-Badge" target="_blank">GitPitch Wiki</a> for details.</span>

#VSLIDE

#### Slideshows Designed For Sharing

<br>

- View any slideshow at its public URL
- [Promote](https://github.com/gitpitch/gitpitch/wiki/Slideshow-GitHub-Badge) any slideshow using a GitHub badge
- [Embed](https://github.com/gitpitch/gitpitch/wiki/Slideshow-Embedding) any slideshow within a blog or website
- [Share](https://github.com/gitpitch/gitpitch/wiki/Slideshow-Sharing) any slideshow on Twitter, LinkedIn, etc
- [Print](https://github.com/gitpitch/gitpitch/wiki/Slideshow-Printing) any slideshow as PDF document
- [Download and present](https://github.com/gitpitch/gitpitch/wiki/Slideshow-Offline) any slideshow offline

#HSLIDE

## GO FOR IT.
## JUST ADD <span style="color:#e49436; text-transform: none">PITCHME.md</span> ;)
