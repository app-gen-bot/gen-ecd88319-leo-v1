#!/bin/bash
# Manage Docker services for AI App Factory context awareness

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed and running
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running"
        echo "Please start Docker Desktop"
        exit 1
    fi
    
    print_success "Docker is running"
}

# Start services
start_services() {
    print_status "Starting context awareness services..."
    
    docker-compose up -d
    
    # Wait for services to be healthy
    print_status "Waiting for services to be ready..."
    
    # Wait for Neo4j
    echo -n "Waiting for Neo4j..."
    for i in {1..30}; do
        if curl -s http://localhost:7474 > /dev/null 2>&1; then
            echo ""
            print_success "Neo4j is ready (http://localhost:7474)"
            break
        fi
        echo -n "."
        sleep 2
    done
    
    # Wait for Qdrant
    echo -n "Waiting for Qdrant..."
    for i in {1..30}; do
        if curl -s http://localhost:6333/health > /dev/null 2>&1; then
            echo ""
            print_success "Qdrant is ready (http://localhost:6333)"
            break
        fi
        echo -n "."
        sleep 2
    done
    
    print_success "All services are running!"
    echo ""
    echo "Service URLs:"
    echo "  - Neo4j Browser: http://localhost:7474 (neo4j/password)"
    echo "  - Qdrant Dashboard: http://localhost:6333/dashboard"
}

# Stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose down
    print_success "Services stopped"
}

# Check service status
check_status() {
    print_status "Service Status:"
    docker-compose ps
    
    echo ""
    print_status "Port Status:"
    echo "Neo4j (7474):" $(nc -zv localhost 7474 2>&1 | grep -o "succeeded\|refused")
    echo "Neo4j Bolt (7687):" $(nc -zv localhost 7687 2>&1 | grep -o "succeeded\|refused")
    echo "Qdrant HTTP (6333):" $(nc -zv localhost 6333 2>&1 | grep -o "succeeded\|refused")
    echo "Qdrant gRPC (6334):" $(nc -zv localhost 6334 2>&1 | grep -o "succeeded\|refused")
}

# Clean all data
clean_data() {
    print_warning "This will delete all stored data!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning data..."
        docker-compose down -v
        print_success "All data cleaned"
    else
        print_status "Cancelled"
    fi
}

# Show logs
show_logs() {
    docker-compose logs -f
}

# Main menu
case "${1:-help}" in
    start)
        check_docker
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        sleep 2
        start_services
        ;;
    status)
        check_status
        ;;
    clean)
        clean_data
        ;;
    logs)
        show_logs
        ;;
    *)
        echo "AI App Factory - Context Services Manager"
        echo "========================================"
        echo ""
        echo "Usage: $0 {start|stop|restart|status|clean|logs}"
        echo ""
        echo "Commands:"
        echo "  start    - Start Neo4j and Qdrant services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  status   - Check service status"
        echo "  clean    - Stop services and delete all data"
        echo "  logs     - Show service logs"
        echo ""
        echo "Services:"
        echo "  - Neo4j: Graph database for graphiti knowledge graph"
        echo "  - Qdrant: Vector database for mem0 memory storage"
        ;;
esac