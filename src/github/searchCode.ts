import axios from 'axios'


export async function searchCode(query: string, token: string) { 
    const headers = {
        Authorization: `Bearer ${token}`,
    }
    const url = `https://api.github.com/search/code?q=${query}`
    const req = await axios.get(url, {
        headers: headers
    })
    var data = req.data
    return data
}