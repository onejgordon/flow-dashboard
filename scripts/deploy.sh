#!/bin/sh

# Usage: ./deploy.sh 0-1 [app.yaml]


INDEX_YAML="index.yaml"
CRON_YAML="cron.yaml"
QUEUE_YAML="queue.yaml"

check_tests(){
	./run_tests.sh
	RESULT=$?
	if [ $RESULT -ne 0 ]; then
		echo -e "\nUNIT TESTS FAILED!\n"
		cancel_deploy
	fi
}

rollback(){
	echo -e "\nRolling back.....\n"
	python APPCFG rollback --oauth2 $(dirname $0)
}

build_js(){
	gulp production --fatal=error --prod_deploy=$production_version
	RESULT=$?
	if [ $RESULT -ne 0 ]; then
		echo -e "\n GULP BUILD FAILED!\n"
		cancel_deploy
	fi
}

deploy(){
	check_tests
	build_js
	cd ../
	gcloud config configurations activate flow
	gcloud app deploy $deploy_configs --quiet --version=$version --no-promote
}

cancel_deploy(){
	echo -e "\nExitted without updating $version!\n"
	exit 1
}

sudo echo "" # cover any sudos required downstream
version=$1
deploy_configs="${@:2}" # Remaining args
# first do a git pull to bring down tags
git pull
# production versions only contain digits, hf and - (dash)
production_version=false
# note: keep in sync with constants.PROD_VERSION_REGEX
if [[ $version =~ ^[0-9\-]+[a-z]?$ ]]; then
	production_version=true
	env="production"
	# if deploying to production, it is compulsory to deploy all services
	deploy_configs="app.yaml $INDEX_YAML $CRON_YAML $QUEUE_YAML"
else
	# cron/index/queue must be specified explicitly
	env="staging"
fi

s_length=$(echo $deploy_configs | wc -c)
if [ "$s_length" -gt 1 ]; then
   prom="Are you sure you want to deploy to $version with configs $deploy_configs? (y/n) "
else
   prom="Are you sure you want to deploy to $version? (y/n) "
fi

read -p "$prom" -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
	#production versions only contain digits, hf and - (dash)
	if [[ $version =~ ^[0-9hf\-]+$ ]]; then
		read -p "This looks like a production version ($version), Are you really sure? (y/n) " -n 1 -r
		echo
		if [[ $REPLY =~ ^[Yy]$ ]]; then
			# if no tag yet create it, then push tags
			git tag -a -m "New production version by $(whoami) on $(date)" "v$version"
			git push --tags
			# deploy production version
			deploy
			echo -e "\n\nDeploy to production Successful!\n"
		else
			cancel_deploy
		fi
	else
		#deploy non-production version
		deploy
	fi
else
	cancel_deploy
fi
