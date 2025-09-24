I would like to build a Proof-of-Concpet project that fullfills the following requirements:

1. the project is set up in docker compose
2. it is comprised of the following services
    * MinIO for storage of two images in one bucket
    * a Javascript web app that displays two images that are stored in MinIO next to each other
    * the Javascript app uses Open Seadragon for displaying images
    * the left image has a title "Image from MinIO with deep zoom"
    * the right image has a title "Regular Image (full-res) from MinIO"
3. General requiremnts
    * no UI framework that requires npm shall be used (no npm install is allowed)
    * the app shall be written in vanilla javasript (no React / Angular / Vue.js, etc.)
    * before any code is generated, please first outline the feasibility and explain about the advised architecture