set -e
OUTDIR=/Users/thanhtran/Documents/landing-page/marketing
enc() { ffmpeg -loglevel error -y -framerate 30 -i frames-$1/%05d.jpg -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -movflags +faststart $OUTDIR/$1-30s.mp4; cp frames-$1/00150.jpg $OUTDIR/$1-cover.jpg; }
THEME=song-hy COLOR= OUT=thiep-song-hy ACCENT='#b3262c' SOFT='#ffd6d2' BG1='#ffe1dc' BG2='#fff1d6' MONTAGE=mau-song-hy--xanh,mau-song-hy--lam,mau-song-hy--nau,mau-long-phung,mau-song-hac,mau-bach-su--do,mau-co-phuc,mau-hoang-kim node render.mjs | tail -1 && enc thiep-song-hy
THEME=hoa-kho COLOR= OUT=thiep-hoa-kho ACCENT='#a85a34' SOFT='#f3dcc7' BG1='#f6e6d6' BG2='#ece8da' MONTAGE=mau-hoa-kho--lam,mau-hoa-kho--hong,mau-hoa-kho--nau,mau-mau-nuoc,mau-vuon-kinh,mau-dong-noi,mau-to-duyen,mau-anh-dao node render.mjs | tail -1 && enc thiep-hoa-kho
THEME=lien-hoa COLOR= OUT=thiep-lien-hoa ACCENT='#c4566f' SOFT='#f8d5dd' BG1='#fde2e8' BG2='#dcefe6' MONTAGE=mau-lien-hoa--trang,mau-lien-hoa--lam,mau-lien-hoa--tim,mau-mau-nuoc,mau-anh-dao,mau-to-duyen,mau-vuon-kinh,mau-bach-su node render.mjs | tail -1 && enc thiep-lien-hoa
ls -la $OUTDIR/*.mp4
