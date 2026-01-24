# Multi-stage build para otimizar tamanho da imagem

# Estágio 1: Build
FROM node:22.15.1-slim AS builder

WORKDIR /usr/src/app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies)
RUN npm install

# Copiar código fonte
COPY . .

# Estágio 2: Production
FROM node:22.15.1-slim AS production

WORKDIR /usr/src/app

# Criar usuário não-root para segurança
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copiar apenas package.json e package-lock.json
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm install --only=production && npm cache clean --force

# Copiar código fonte do estágio de build
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/tsconfig.json ./

# Mudar ownership dos arquivos para o usuário não-root
RUN chown -R appuser:appuser /usr/src/app

# Mudar para usuário não-root
USER appuser

# Expor porta da aplicação
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar a aplicação
CMD ["node", "--experimental-strip-types", "src/app.ts"]