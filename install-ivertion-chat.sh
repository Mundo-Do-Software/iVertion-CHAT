#!/bin/bash

# Definir cores para a saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BROWN='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
cat arts/yoda.txt
echo -e "${NC}"

echo -e "${GREEN}

Para você, o iVertion CHAT instalar eu vou!!!${NC}"

sleep 3
clear

# Carregar e exportar as variáveis de ambiente do arquivo .env na raiz do projeto

echo -e "${BROWN}"
cat arts/chewbacca.txt
echo -e "${NC}"
echo -e "${GREEN}

Wohhhh Whhooo w Woooo...${NC}"
sleep 1
echo -e "${GREEN}

Traduzindo ...${NC}"
sleep 1
echo -e "${GREEN}

Carregando variáveis de ambiente...${NC}"
set -a  # Marca automaticamente as variáveis como exportadas
source config.env
set +a

sleep 3
clear
cat arts/bb-8.txt

# Instalar Node.js e PM2
echo -e "${GREEN}

Instalando Node.js e PM2...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

clear
echo -e "${BROWN}"
cat arts/obi-wan-kenobi.txt
echo -e "${NC}"

# Instalar dependências e configurar o backend
echo -e "${GREEN}

Usando a forca para configurar o backend...${NC}"
cd backend
npm install
npm run build
npx sequelize-cli db:create
npm run db:migrate
npm run db:seed
pm2 start dist/server.js --name ivertion-chat-backend --time --env production

clear
echo -e "${YELLOW}"
cat ../arts/luke.txt
echo -e "${NC}"

echo -e "${GREEN}

Configurando o frontend...${NC}"

sleep 3
clear
cat ../arts/vader.txt
echo -e "${GREEN}

Sou seu pai, eu configuro o frontend...${NC}"

cd ../frontend

# Instalar dependências do frontend
npm install

# Construir o frontend para produção
npm run build

# Configurar PM2 para servir o frontend corretamente
npm run start

# Salvar a configuração do PM2 e habilitar o startup
pm2 save
pm2 startup


echo -e "${GREEN}"
cat ../arts/yoda.txt
echo -e "${NC}"

echo -e "${GREEN}

Com sucesso a instalação concluída foi!${NC}"

pm2 list
