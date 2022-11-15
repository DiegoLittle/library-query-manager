import axios from "axios";



async function queryNpm(query: string) {
    const url = `https://registry.npmjs.com/-/v1/search?text=${query}`;
    const response = await axios.get(url);
    return response.data
}