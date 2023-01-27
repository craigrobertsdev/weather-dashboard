# Weather Dashboard

## Table of Contents

- [Motivation](#motivation)
- [Problem Solved](#problem-solved)
- [What I Learned](#what-i-learned)
- [Site Access](#site-access)

<br>
<p align="center">
  <img alt="Portfolio page" src="https://github.com/craigrobertsdev/weather-dashboard/blob/main/screenshot.jpg">
</p>


## Motivation

This project was motivated by the need to know what the weather will be like, in whatever part of the world I may be in.

## Problem Solved

The application takes user input based on the location they want the weather for and displays the current weather and the 5-day forecast for that location. 

The user's previous searches are saved to local storage so the query can be re-run more easily on returning to the page.

## What I Learned

From this project, I learnt how to query third-party APIs and use async/await functionality to ensure my asynchronous fetch requests were completing before another one started, all while writing code in a clean and readable manner.

The data is retrieved by querying the OpenWeatherMap geolocation API to convert the searched-for city into co-ordinates, then passing them to the 5-day forecast API from the same provider.  

## Site Access
This site was built using Github Pages and can be found [here](https://craigrobertsdev.github.io/weather-dashboard/)
