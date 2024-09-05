# Overview

This project is an **OpenAI Batch Processor** built with **Node.js** and **TypeScript**. It efficiently handles batch requests to the OpenAI API. Below, you'll find more details about the app, its features, and how it works.

## Project Purpose

The **OpenAI Batch Processor** is designed to automate the management of batch files for the OpenAI API. This app ensures that:

1. **Newer files are uploaded**: The app checks batch files in the source directory and uploads only those that are newer than the OpenAI counterpart.
2. **Updated results are downloaded**: It downloads batch results to the target directory.

## Features

- **Batch File Uploads**: Automatically uploads `.jsonl` batch files from a source directory that are newer than their OpenAI counterpart.
- **Batch Results Download**: Downloads OpenAI batch results to a target directory, only if they are newer than the local copy.

## Tech stack & Dependeccies

- **Programming Languages**: Node.js, TypeScript
- **API Development**: OpenAI API, Batch API
- **Libraries**:
  - **[openai nodejs](https://github.com/openai/openai-node)**


## OpenAI Usage

This app interacts with the **OpenAI Batch API** to manage asynchronous requests in large batches. By batching requests, it ensures lower costs and increased processing throughput, ideal for scenarios where immediate responses aren't necessary. Key operations include:
- Uploading `.jsonl` batch files.
- Creating and managing batch jobs.
- Monitoring batch status and downloading results.


## Installation and Setup

### Prerequisites

- **Node.js**: You need Node.js installed on your machine (`>=14.x.x`).
- **OpenAI API Key**: Get your API key by signing up at [OpenAI](https://beta.openai.com/signup/).


## How to Run and Test the App

The app exposes two primary endpoints for testing the functionality. You can use **Postman**, **cURL**, or any HTTP client to interact with these endpoints.

### 1. Process Batches (`/process-batches`)

This endpoint processes all the batches in the source directory, uploads the newer files to OpenAI, and creates OpenAI batches for them.

- **Method**: GET
- **URL**: `http://localhost:3000/process-batches`

**Example request using cURL**:

```bash
curl -X GET http://localhost:3000/process-batches
```
## 1. Download Results (`/download-results`)

This endpoint downloads OpenAI batch results to the target directory.

- **Method**: POST
- **URL**: `http://localhost:3000/download-results`

**Example request using cURL**:

```bash
curl -X POST http://localhost:3000/download-results`
```


