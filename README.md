Given a Github username and a year, renders a 3D model of their contribution chart. The data is fetched via a server less function ([repo](https://github.com/jasonlong/json-contributions)).

```
?username=<username>&year=<year>
```

Example: https://3d-contributions.vercel.app/?username=jasonlong&year=2018

#### Development

I've been using `vercel` for local dev. To load up a local server: `vercel dev`.
