#!/bin/bash
dir=$(cd $(dirname $0); pwd)
cd ${dir}
cd ../
pwd
if [ $# -ne 1 ]; then
    echo "please input env";
elif [ $1 = 'dev' ]; then
	echo "DEV build";
	cp deploy/settings/front_dev.cnf src/module/common/const.ts;
	cp deploy/settings/potter_genre.cnf src/module/common/genrelist.ts;
	git show --format='export const SRC_VERSION="%h";' --no-patch >> src/module/common/const.ts;
	npx webpack; node server.js;
elif [ $1 = 'stg' ]; then
	echo "deploy to STG server";
	cp deploy/settings/front_stg.cnf src/module/common/const.ts;
	cp deploy/settings/potter_genre.cnf src/module/common/genrelist.ts;
	git show --format='export const SRC_VERSION="%h";' --no-patch >> src/module/common/const.ts;
	npx webpack; scp -r ./public/* bizendao:web/stg;
	scp ./public/.htaccess bizendao:web/stg/
elif [ $1 = 'flow' ]; then
	echo "deploy to FLOW server";
	cp deploy/settings/front_flow.cnf src/module/common/const.ts;
	cp deploy/settings/creator_genre.cnf src/module/common/genrelist.ts;
	git show --format='export const SRC_VERSION="%h";' --no-patch >> src/module/common/const.ts;
	npx webpack; scp -r ./public/* bonsoleil:web/flow/www/;
	scp ./public/.htaccess bonsoleil:web/flow/www/;
elif [ $1 = 'prd' ]; then
	cp deploy/settings/front_prd.cnf src/module/common/const.ts;
	cp deploy/settings/potter_genre.cnf src/module/common/genrelist.ts;
	git show --format='export const SRC_VERSION="%h";' --no-patch >> src/module/common/const.ts;
	npx webpack; scp -r ./public/* bizendao:web/bizen/;
	scp ./public/.htaccess bizendao:web/bizen/;
elif [ $1 = 'local' ]; then
	cp deploy/settings/front_prd.cnf src/module/common/const.ts;
	cp deploy/settings/potter_genre.cnf src/module/common/genrelist.ts;
	git show --format='export const SRC_VERSION="%h";' --no-patch >> src/module/common/const.ts;
	npx webpack; node server.js;
else
	echo 'input error'
	exit
fi
