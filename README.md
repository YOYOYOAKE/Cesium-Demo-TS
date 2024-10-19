# Cesium-Demo-TS
A project built with Vue 3, TypeScript, and Cesium that displays shapefiles or other geographic data in the browser.

## Features

- **Base map selection**: Choose from available maps. Currently, AMap Vector Map and AMap Image Map are supported.
- **Shapefile display**: Upload and display shapefiles from your local computer. You can display all, part, or none of the data.

![Main](./image/main.png)

## Future Improvements

- **Support for more formats**: Additional data formats such as GeoJSON, CSV, and XLSX will be supported.
- **More tools**: Visualization tools like heat maps, scatter maps, and OD stream maps will be added.

## Installation and Usage

1. Clone this repository:

```shell
git clone https://github.com/YOYOYOAKE/Cesium-Demo-TS.git
```

2. Navigate to the project directory and use pnpm to install the dependencies (Node.js version >= 18 is recommended):

```shell
npm -g install pnpm
pnpm install
```

1. Start the development server:

```
npm run dev
```

4. Open the app in your browser at the provided local address (e.g., http://localhost:5173).