# Osiris

**OS**iris on your server with **N**ode**JS**.

> This is a work-in-progress web desktop client for Linux servers that takes that hard part out of remote computing.

## Motivation

It'd be sweet to have a low-latency remote desktop client that runs in the web and 
is written with a solid framework that is endlessly customizable. Any developer
familiar with building web apps can create an application. Add ontop being able to remotely 
run both Windows and Linux native apps in your browser, computing and cluster management.

Enter Osiris, a robust approach to building a desktop on the web, with enterprise-grade
security and customizability by default. Extend

## Status

![](https://github.com/lume/glas/workflows/Node%20CI/badge.svg)

> #### ⚠️ ALPHA STATE

The project is currently in its very early alpha stages. We are in the process of
solidifying the base of the framework, and beginning to build base ISO images for 
ease-of deployment

## How It Works

We have an HTML page that loads the application, and creates a desktop with a series of event
bindings that recreate the functionality of a desktop window manager. We include a runner for 
xpra applications on the linux device and a windows installation running virtualized within the
linux container.

### Build & Run

To run the example GLAS application in your browser use the following command:

```sh
# install or update dependencies
npm install

# build and serve the project in browser
npm start
```

<!-- ## [Development](.github/DEVELOPMENT.md)

If you are interested in developing **Osiris** please read the detailed process
on our [**development page**](.github/DEVELOPMENT.md) -->


## Inspiration
 - [Synology DSM](https://www.synology.com/en-us/dsm)
 - [OS.js](https://github.com/os-js/OS.js)
 - [web-desktop-environment](https://github.com/shmuelhizmi/web-desktop-environment)

<!-- import { XpraPacketWebWorker } from "xpra-html5-client"; -->


## Roadmap
 - [ ] Run linux apps using xpra
 - [ ] Run windows apps using xpra (running virtualized on ISO)
 - [ ] Create Iframe API and loaders
 - [ ] Install and Link VS Code
 - [ ] Integrate Octoprint
 - [ ] Integrate Plex and other media apps
 - [ ] Broadway support for GTK3 apps [ref.](http://www.webupd8.org/2013/06/how-to-install-gtk3-with-broadway-html5.html)
 - [ ] Rewrite xpra-html5 client with TS (seperate project or fork)
 - [ ] Destroy all humans


 <!-- https://github.com/m1k1o/neko -->
 <!-- https://github.com/selkies-project/selkies-gstreamer -->
 <!-- https://github.com/novnc/noVNC -->
