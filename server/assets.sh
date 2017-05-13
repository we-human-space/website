cd ../.assets;
[ -d "futura" ] && rm -rf futura;
mkdir futura;
unzip FS-WebFonts-1034365548.zip -d futura;
[ -d "../client/blog/assets/fonts/futura" ] && rm -rf ../client/blog/assets/fonts/futura;
mkdir -p ../client/blog/assets/fonts/futura;
cp -r futura/Fonts/* ../client/blog/assets/fonts/futura;
cp -r futura/Eulas/* ../client/blog/assets/fonts/futura;
rm -rf futura;
