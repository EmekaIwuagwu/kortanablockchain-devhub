CXX = g++
CXXFLAGS = -O2 -std=c++17 -Wall
LDFLAGS = -lpthread

TARGET = environment-manager
SRCS = main.cpp allocator.cpp deployer.cpp url_manager.cpp
OBJS = $(SRCS:.cpp=.o)

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CXX) $(CXXFLAGS) -o $(TARGET) $(OBJS) $(LDFLAGS)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -f $(TARGET) $(OBJS)
