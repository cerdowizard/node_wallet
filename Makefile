port: 5432

start:
	@echo "Starting the application..."
	bun run dev

stop:
	@echo "Stopping the application..."
	@echo "Note: Use Ctrl+C to stop the development server"

restart:
	@echo "Restarting the application..."
	@echo "Note: The development server will automatically restart on file changes"
	make start

migrate:
	@echo "Running migrations..."
	bunx prisma migrate dev

generate:
	@echo "Generating Prisma client..."
	bunx prisma generate

studio:
	@echo "Starting Prisma Studio..."