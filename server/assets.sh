cd ../.assets;
unzip FS-WebFonts-1034365548.zip -d futura;
mkdir -p ../client/blog/assets/fonts/futura;
mv futura/Fonts/* ../client/blog/assets/fonts/futura;
mv futura/Eulas/* ../client/blog/assets/fonts/futura;
rm -rf futura;
