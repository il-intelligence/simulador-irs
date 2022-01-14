run:
	docker run -p 80:80 -v $(shell pwd)/:/usr/share/nginx/html/ --rm --name irs nginx
