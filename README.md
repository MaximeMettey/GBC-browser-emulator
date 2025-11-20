# Game Boy Color Browser Emulator 🎮

Un émulateur Game Boy Color entièrement fonctionnel dans le navigateur avec une interface réaliste représentant une Game Boy Color violette transparente.

![Game Boy Color Emulator](https://img.shields.io/badge/Status-Functional-success)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Fonctionnalités

### Émulation
- ✅ Émulation complète Game Boy et Game Boy Color
- ✅ Chargement de ROMs (.gb, .gbc)
- ✅ Sauvegarde d'états (localStorage)
- ✅ Téléchargement/Import de fichiers de sauvegarde
- ✅ Support audio avec contrôle du volume

### Interface
- 🎨 Design réaliste d'une Game Boy Color violette transparente
- 📱 Optimisé pour mobile et tactile
- 🖥️ Mode plein écran
- 🎮 Boutons fonctionnels avec feedback visuel
- ⚙️ Menu de paramètres intégré

### Contrôles
- ⌨️ **Clavier:**
  - Flèches directionnelles - D-Pad
  - Z - Bouton A
  - X - Bouton B
  - Entrée - Start
  - Shift - Select

- 📱 **Tactile:**
  - Boutons à l'écran entièrement fonctionnels

## 🚀 Utilisation

### Installation Locale

1. Clonez le repository:
```bash
git clone https://github.com/MaximeMettey/GBC-browser-emulator.git
cd GBC-browser-emulator
```

2. Ouvrez `index.html` dans votre navigateur web

Ou utilisez un serveur local:
```bash
# Avec Python 3
python -m http.server 8000

# Avec Node.js
npx http-server
```

Puis ouvrez http://localhost:8000 dans votre navigateur.

### Chargement d'une ROM

1. Cliquez sur le bouton **Settings** (⚙️) en bas à droite
2. Dans la section "Load ROM", cliquez sur **Load ROM**
3. Sélectionnez votre fichier ROM (.gb ou .gbc)
4. Le jeu se lance automatiquement!

### Sauvegarde et Chargement

**Sauvegarde locale (navigateur):**
- Cliquez sur **Save State** dans les paramètres
- La sauvegarde est stockée dans localStorage

**Téléchargement de sauvegarde:**
- Cliquez sur **Download State** pour télécharger un fichier .sav
- Conservez ce fichier pour réimporter plus tard

**Import de sauvegarde:**
- Cliquez sur **Upload State** et sélectionnez votre fichier .sav

## 📁 Structure du Projet

```
GBC-browser-emulator/
├── index.html              # Page principale
├── css/
│   └── gbc.css            # Styles de l'interface GBC
├── js/
│   ├── other/
│   │   ├── base64.js      # Utilitaires base64
│   │   ├── resampler.js   # Resampler audio
│   │   └── XAudioServer.js # Serveur audio
│   ├── GameBoyCore.js     # Cœur de l'émulateur
│   ├── GameBoyIO.js       # I/O et gestion ROM
│   ├── emulator-core.js   # Intégration de l'émulateur
│   └── app.js             # Logique de l'application
└── README.md              # Documentation
```

## 🔧 Technologies Utilisées

- **HTML5 Canvas** - Rendu graphique
- **CSS3** - Interface réaliste avec effets transparents
- **JavaScript (ES6+)** - Logique de l'application
- **GameBoy-Online** - Émulateur GBC éprouvé (embarqué localement)
- **LocalStorage API** - Sauvegarde persistante
- **Fullscreen API** - Mode plein écran
- **File API** - Import/Export de ROMs et sauvegardes

## 📱 Compatibilité Mobile

L'émulateur est optimisé pour les appareils mobiles:
- Interface responsive
- Contrôles tactiles
- Mode plein écran pour une expérience immersive
- Optimisé pour les écrans de différentes tailles

## ⚖️ Légalité et ROMs

**Important:** Cet émulateur ne contient aucune ROM. Vous devez posséder légalement les jeux que vous utilisez.

- Les ROMs de jeux commerciaux sont protégées par le droit d'auteur
- Télécharger des ROMs de jeux que vous ne possédez pas est illégal dans la plupart des pays
- Utilisez uniquement des ROMs homebrew ou de jeux que vous possédez physiquement

## 🐛 Dépannage

**L'émulateur ne se charge pas:**
- Assurez-vous que tous les fichiers JS sont présents dans le dossier js/
- Ouvrez la console du navigateur (F12) pour voir les erreurs
- Essayez de rafraîchir la page

**La ROM ne se charge pas:**
- Vérifiez que le fichier est bien une ROM .gb ou .gbc valide
- Vérifiez la taille du fichier (doit être < 8 MB)

**Pas de son:**
- Vérifiez le volume dans les paramètres
- Vérifiez le volume de votre navigateur/système
- Certains navigateurs bloquent l'audio automatique

## 🤝 Contributions

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Ce projet utilise GameBoy-Online qui est sous licence MIT.

## 🙏 Remerciements

- **Grant Galitz** - Pour GameBoy-Online, l'émulateur GBC de base
- La communauté de l'émulation pour leur travail incroyable

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

---

Fait avec ❤️ pour les nostalgiques de la Game Boy Color