import axios from "axios";

//Escreve somente /api pois o back-end e front-end estão no mesmo projeto. Então não é necessário escrever http://localhost:3000/api
export const api = axios.create({
    baseURL: "/api"
});
