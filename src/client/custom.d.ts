/**
 * Allow svg loading
 */

declare module "*.svg" {
    const content: string;  // url to the svg file that is placed by webpack
    export default content;
}