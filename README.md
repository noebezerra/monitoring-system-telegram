# O Projeto

Monitoramento para o sistema de ERP MDLOG, com alertas de fechamento das lojas.

## Instalação

Faça um clone do projeto

Execute um container do docker com Oracle instantclient e Nodejs

```bash
docker run -it --name <nome-container> -v /$(PWD)/<meu-projeto>:/home/node noebezerra/ubuntu-oracle-node:latest bash
```

_No Git Bash Windows é necessário fazer o escape com `/` antes de `$(PWD)`_

### Cron (Agendamento)

No `index.js` encontrará o comando abaixo, programe a execução de acordo com o termino do encerramento das lojas.

```js
//segundos(opcional) | minutos | horas | dia do mes | mes | dia da semana
cron.schedule('*/2 * * * *', () => {
  // code...
});
```

### Ativando

Após para o funcionamento pode-se usar o PM2

```bash
npm run start:watch
```

# Sobre o Container

Docker - Ubuntu & Nodejs & Oracle

# Sobre

Imagem para container com Nodejs e Oracle instantclient

#### Acessando o container

```cmd
docker exec -it <nome-container> bash
```

_Caso ocorra problemas de permissão, tente mover o projeto para outra pasta e cluir a pasta `node` da `home`, após recrie novamente com `mkdir node` e mova novamente o projeto para a pasta_

Logs

```cmd
pm2 monit
```
