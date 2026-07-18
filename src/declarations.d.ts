// NativeWind transforms `import "./global.css"` at build time (metro withNativeWind);
// this declares the module so tsc accepts the side-effect import.
declare module "*.css";
