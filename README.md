# Suno Bulk Downloader

A lightweight, local Node.js application that allows you to bulk download audio files directly from Suno. By extracting the song IDs from standard Suno links, this tool bypasses third-party APIs and downloads the MP3 files straight from Suno's Content Delivery Network (CDN) into organized local folders.

## Features

* **Direct CDN Downloads:** Bypasses external APIs by fetching files directly from `cdn1.suno.ai`.
* **Bulk Processing:** Queue up multiple URLs and download them in one go.
* **Custom Folder Organization:** Specify a folder name to keep your downloaded tracks organized.
* **Modern Web Interface:** A clean, glassmorphism-styled UI built with Tailwind CSS.

## Prerequisites

* **Node.js** (version 18.0.0 or higher is required for native `fetch` support).

## Installation

1. Create a new directory for your project and place the project files (`server.js`, `package.json`, and `public/index.html`) inside it.
2. Open your terminal in the project directory.
3. Install the required dependencies:

```bash
npm install
