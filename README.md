# Graph Grader

This project is a simple graph grading service built with **Node.js** and **Express**. It uses the [JigsawStack AI APIs](https://jigsawstack.com/docs/api-reference) to detect plotted points and text on an uploaded image of graph paper. Detected regions are highlighted with translucent boxes and the annotated image is returned to the user.

## Features

- Upload an image of a graph via the web interface
- Detect "star" plots and text labels using JigsawStack's Object Detection API
- Recognize axis labels and values using the VOCR API
- Receive the image back with bounding boxes drawn over detected areas

## Setup

1. Install Node.js (version 18 or later is recommended).
2. Clone this repository and install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root with your API key from JigsawStack:
   ```ini
   JIGSAW_API_KEY=YOUR_API_KEY_HERE
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open `http://localhost:3000` in your browser and upload a graph image to test the grader.

## Notes

- API responses are expected to include bounding box information in the format `{x, y, width, height}` for each detection.
- The server stores uploaded and annotated images in the `uploads/` directory. Annotated images are not automatically deleted.
- This project uses the following JigsawStack endpoints:
  - **Object Detection:** `POST https://jigsawstack.com/api/ai/object-detection/v1/detect`
  - **VOCR (Vision OCR):** `POST https://jigsawstack.com/api/ai/vocr/v1/detect`

The implementation here is a minimal example and may require adjustments depending on the exact API response structure from JigsawStack.
