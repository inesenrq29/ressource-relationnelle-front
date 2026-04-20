# Ressource Relationnelle

## Prérequis

- Avoir **Node.js** installé

Pour vérifier si Node.js et npm sont installés, taper dans le terminal :

```bash
node -v
npm -v
````

> Attention : la commande correcte est `npm -v` et non `mpn -v`.

Si aucune version ne s'affiche, cela signifie que Node.js n'est pas installé.

Pour le télécharger :

* aller sur le site officiel : [https://nodejs.org](https://nodejs.org)
* cliquer sur **LTS**

---

## Recommandation de version Node

Pour ce projet Angular, il est recommandé d’utiliser **Node 22**.

Si tu utilises `nvm`, tu peux faire :

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

Puis vérifier :

```bash
node -v
npm -v
```

---

## Installation d’Angular

Taper ces commandes dans le terminal :

```bash
npm install -g @angular/cli
ng version
```

---

## Création du projet Ressource Relationnelle

Créer le projet avec :

```bash
ng new ressource-relationnelle
```

### Paramètres choisis

* **Routing** : non
* **Style** : CSS pour le moment, la configuration sera peut-être à changer plus tard
* **IA** : None

> Si le projet existe déjà dans un dépôt Git, il ne faut pas refaire `ng new`.
> Il faut simplement cloner le repo, se placer dedans, puis installer les dépendances.

---

## Accès au projet

Se placer dans le dossier du projet :

```bash
cd ressource-relationnelle
```

---

## Installation des dépendances

Avant de lancer le projet, installer les dépendances :

```bash
npm install
```

---

## Lancement du projet

Si tu utilises `nvm`, pense à activer la bonne version de Node avant de lancer le projet :

```bash
nvm use 22
```

Puis lancer le projet :

```bash
ng serve
```

L’application sera accessible à l’adresse suivante :

```bash
http://localhost:4200
```

---

## Ajout de Lint

Le linting permet :

* de détecter les erreurs dans le code TypeScript et HTML
* d’appliquer des règles de bonnes pratiques
* d’assurer une qualité de code homogène dans le projet
* de prévenir les bugs avant l’exécution ou la mise en production

Pour l’ajouter, taper cette commande :

```bash
ng add angular-eslint
```

> Sur les versions récentes d’Angular, cette commande est préférable à `ng add @angular-eslint/schematics`.

### Lancement du lint

```bash
ng lint
```

### Correction automatique de certaines erreurs

```bash
ng lint --fix
```

---

## Ajout de Prettier

Prettier permet de formater le code automatiquement.

### Installation de Prettier

```bash
npm install --save-dev prettier
```

### Installation des intégrations ESLint

```bash
npm install --save-dev eslint-config-prettier eslint-plugin-prettier
```

---

## Ajout de la configuration Prettier

Tu peux soit :

* ajouter la configuration dans le `package.json` sous la clé `prettier`
* créer un fichier `.prettierrc`

Exemple de fichier `.prettierrc` :

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all"
}
```

---

## Ignorer les fichiers générés

Créer un fichier `.prettierignore` avec :

```txt
node_modules/
dist/
build/
.angular/
coverage/
```

---

## Ajout des scripts dans `package.json`

Ajouter les scripts suivants pour formater et vérifier :

```json
"scripts": {
  "start": "ng serve",
  "lint": "ng lint",
  "lint:fix": "ng lint --fix",
  "format": "prettier --write \"src/**/*.{ts,html,css,scss,js,json,md}\"",
  "format:check": "prettier --check \"src/**/*.{ts,html,css,scss,js,json,md}\""
}
```

---

## Intégration avec ESLint

### Si le projet utilise `eslint.config.js`

Avec la configuration moderne ESLint, il ne faut pas ajouter directement :

```js
"plugin:prettier/recommended"
```

dans les `extends` de `eslint.config.js`.

Il faut plutôt importer Prettier dans le fichier `eslint.config.js` et l’ajouter à la fin.

Exemple :

```js
// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  },
  prettierRecommended,
]);
```

---

## Exécution de Prettier

```bash
npm run format
npm run format:check
```

---

## Commandes utiles du quotidien

```bash
node -v
npm -v
ng version
npm install
ng serve
ng lint
ng lint --fix
npm run format
npm run format:check
```

---

## Résolution de problèmes fréquents

### Erreur : `mpn: command not found`

Correction :

```bash
npm -v
```

### Erreur : version Node non supportée par Angular

Vérifier que tu utilises bien Node 22 :

```bash
nvm use 22
node -v
```

### Erreur : `Could not find the '@angular/build:dev-server' builder's node package`

Nettoyer puis réinstaller les dépendances :

```bash
rm -rf node_modules package-lock.json
npm install
```

Puis relancer :

```bash
ng serve
```

### Erreurs Prettier dans le lint

Lancer :

```bash
ng lint --fix
```

ou :

```bash
npm run format
npm run lint
```

---

## Démarrage rapide du projet

```bash
cd ressource-relationnelle
nvm use 22
npm install
ng serve
```

```
