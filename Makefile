.PHONY: all jitsu minify

all: minify
	./scripts/jitsu-prepare.sh

minify:
	./scripts/closurize.sh

jitsu:
	cd node; jitsu deploy