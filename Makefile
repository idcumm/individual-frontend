.PHONY: run install lint fix build preview

run:
	npm run dev

install:
	npm install

lint:
	npm run lint

fix:
	npx eslint . --fix

build:
	npm run build

preview: build
	npm run preview
