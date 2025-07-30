import { createApp } from "vue";
import { createPinia } from "pinia";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import VueCryptojs from "vue-cryptojs";
import gsap from "gsap";
import App from "@/App.vue";

const pinia = createPinia();
const app = createApp(App);

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
app.use(VueCryptojs).use(pinia).mount("#app");
