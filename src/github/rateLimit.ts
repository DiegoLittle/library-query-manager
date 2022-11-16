import axios from 'axios'

export async function getRateLimit(token:string) {
    const headers = {
        Authorization: `Bearer ${token}`,
    }
    const url = `https://api.github.com/users/diegolittle`
    const req = await axios.get(url, {
        headers: headers
    })
    var data = req.data
    const remaining = req.headers['x-ratelimit-remaining']
    return remaining
}