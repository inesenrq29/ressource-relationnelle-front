# Ressource Relationnelle
## Prérequis
- Avoir Node d'installé
Pour vérifier si Node est installé taper ceci:
```bash
node -v
mpn -v
```
Si aucune version ne s'affiche, cela signifie que Node n'est pas installé
Pour le télécharger:
Aller sur le site officiel:
https://nodejs.org et cliquer sur LTS

## Installation d'Angular:
Taper ces commandes dans le terminal:
```bash
npm install -g @angular/cli
ng version
```

## Création du projet Ressource Relationnelle
ng new <nom-projet> ici:
```bash
ng new ressource-relationnelle
```
Routing: non
Style: CSS pour le moment, la configuration sera peut-être à changer plus tard
IA: None

### Accès au projet
cd <mon-projet> c'est-à-dire ici
```bash
cd ressource-relationnelle
```

### Lancement du projet
```bash
ng serve 
```

## Ajout de Lint
Le linting permet :
- de détecter les erreurs dans le code TypeScript/HTML
- d’appliquer des règles de bonnes pratiques
- d’assurer une qualité de code homogène dans le projet
- de prévenir les bugs avant l’exécution ou la mise en production
Pour l'ajouter, taper cette commande:
```bash
ng add @angular-eslint/schematics
```

### Lancement du Lint
```bash
ng lint
```
### Correction automatique de certaines erreurs
```bash
ng lint --fix
```
## Ajout de Prettier
Permet de formatter le code

### Installation de Prettier

```bash
npm install --save-dev prettier
```

### Installation des intégrations ESLint

```bash
npm install --save-dev eslint-config-prettier eslint-plugin-prettier
```

### Ajout de la configuration Prettier (optionnel) :
- Vous pouvez mettre des options dans `package.json` sous la clé `prettier`, ou créer un fichier `.prettierrc`

### Ignorer les fichiers générés en créant `.prettierignore` 

```
node_modules/
dist/
build/
.angular/
coverage/
```

### Ajout des scripts dans `package.json` pour formater et vérifier

```json
"scripts": {
	"format": "prettier --write \"src/**/*.{ts,html,css,scss,js,json,md}\"",
	"format:check": "prettier --check \"src/**/*.{ts,html,css,scss,js,json,md}\""
}
```

### Intégration avec ESLint
Ajouter `"plugin:prettier/recommended"` dans les `extends` d'`eslint.config.js` pour que Prettier et ESLint coopèrent

### Exécution de Prettier

```bash
npm run format
npm run format:check
```

