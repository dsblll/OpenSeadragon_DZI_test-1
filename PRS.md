I would like to build a Proof-of-Concpet project that fullfills the following requirements:

1. the project is set up in docker compose
2. it is comprised of the following services
    * MinIO for storage of two images in one bucket
    * a Javascript web app that displays two images that are stored in MinIO next to each other
    * the Javascript app uses Open Seadragon for displaying images
    * the left image has a title "Image from MinIO with deep zoom"
    * vips is used for deep zoom image pre-processing
    * the right image has a title "Regular Image (full-res) from MinIO"
3. General requiremnts
    * no UI framework that requires npm shall be used (no npm install is allowed)
    * the app shall be written in vanilla javasript (no React / Angular / Vue.js, etc.)
    * before any code is generated, please first outline the feasibility and explain about the advised architecture
4. on both left and right images
    * two polygon overlays are placed (overlay 1: A little left of the images' center. Overlay 2: A little right of the images' center)
    * by means of a click on a button "Show/Hide Overlay 1" overlay 1 is shown (if hidden before) or hidden (if shown before)
    * by means of a click on a button "Show/Hide Overlay 2" overlay 2 is shown (if hidden before) or hidden (if shown before)
    * canvas overlays are used for performance reasons (no SVG or OpenSeadragon's built-in overlay system)