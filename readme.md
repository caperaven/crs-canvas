# CRS Application Starter

## Introduction

This is a template application based on [CRS Starter](https://github.com/caperaven/crs-starter).  
It includes the:
1. [CRS Router](https://github.com/caperaven/crs-router)
2. [CRS Binding Engine](https://github.com/caperaven/crs-binding/)
3. [CRS Modules](https://github.com/caperaven/crs-modules)

The purpose here for rapid application development where the moving parts are already set up and ready to go for application development.

Additionally this template also uses [CRS Process Api](https://github.com/caperaven/crs-process-api).  
The process api acts as the core of features to be program against and also driven using json schemas.

## Views
The application comes by default with three views already configured.

1. FaceSelect - default view with view model
2. About - html only view
3. 404 - html only view

## Styles
There are some basic styles set up.  
The styles are broken down into logical files that can be used in a modular way.

1. lib folder
    1. variables.css - css color variables
    1. header.css - header styles
    1. footer.css - footer styles
    1. main.css - main element and crs-router styles
    1. text.css - h1 -> h6 styles
    1. views.css - base for all views and imported in the views
1. views folder
    1. welcome.css - styles for the welcome view
    1. about.css - styles for the about view
    1. 404.css - styles for the 404 view
1. styles.css - main stylesheet

# Temp

## Videos
https://www.youtube.com/watch?v=d8cfgcJR9Tk&t=19s

## Tools
https://github.com/Chlumsky
https://playground.babylonjs.com/#1OH09K#131
https://cyos.babylonjs.com/

## References
https://playground.babylonjs.com/#H6UIFZ
https://github.com/Butterwell/mtsdf-fonts/tree/main/src
https://blog.mapbox.com/drawing-text-with-signed-distance-fields-in-mapbox-gl-b0933af6f817

## Examples
https://playground.babylonjs.com/#026IT4#2

## SDF font details
We are using Signed Distance Field fonts for the text rendering.
The build convert_msdf.js script runs the entire process to generate the font atlas and json file.

We use msdf-atlas-gen to generate the font atlas and json file.

The build script then creates a new js file for faster consumption by the application. It will also recreate the texture based on the parameters defined in the convert_msdf.js file.

We recommend that you use the following command to generate the font atlas and json file.
```
msdf-atlas-gen -font ./normal.ttf -type sdf -imageout output/normal.png -format png -json output/normal.json -size 64 -pxrange 4
```

Its important to note that the pxrange is set to a value that can be used for smaller fonts. If this value is to low, the font will render lossy when its small.

Within the assets folder we have the generated texture and also the shaders to render the font.
