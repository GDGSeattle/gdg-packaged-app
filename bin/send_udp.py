import socket

UDP_IP = "localhost"
UDP_PORT = 9876

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.sendto("Hello, world", (UDP_IP, UDP_PORT))
