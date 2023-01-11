import { createApp } from 'vue'
import App from './App.vue'
//import Datepicker from '@vuepic/vue-datepicker';
//import '@vuepic/vue-datepicker/dist/main.css'

import PrimeVue from 'primevue/config';
/* eslint-disable */
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import MultiSelect from 'primevue/multiselect';
import Calendar from 'primevue/calendar';
import "primeflex/primeflex.css";
import "primevue/resources/themes/lara-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

const app = createApp(App);

app.component('Accordion', Accordion);
app.component('AccordionTab', AccordionTab);
app.component('MultiSelect', MultiSelect);

app.component('Calendar', Calendar);
app.use(PrimeVue)/*.component('Datepicker', Datepicker)*/.mount('#app')

