# Docker - Ubuntu & Nodejs & Oracle

# Sobre

Imagem para container com Nodejs e Oracle instantclient

# Install

Crie um arquivo com o projeto

```cmd
mkdir <meu-projeto>
```

```cmd
docker run -it --name <nome-container> -v /$(PWD)/<meu-projeto>:/usr/app noebezerra/ubuntu-oracle-node:1.4 bash
```

```
docker run -it --name teste --net sql-com-oracle-database_default -v /$(PWD)/app:/usr/app noebezerra/ubuntu-oracle-node:1.4 bash
```

_No Git Bash Windows é necessário fazer o escape com `/` antes de `$(PWD)`_

Iniciando o container em segundo plano

```cmd
docker run -it -d --name <nome-container> -v /${PWD}/app:/usr/app noebezerra/ubuntu-oracle-node:1.5
```

# Iniciando o projeto

```cmd
docker exec -it monit bash
```

```
npm run start:watch
```

Logs

```cmd
pm2 monit
```

# Cron (Agendamento)

No `index.js` encontrará o comando abaixo, mude de acordo com sua prefenrência.

```js
cron.schedule('*/2 * * * *', () => {
  enviarMensagens();
});
```
