// Output //

void output(const char* msg) {
  std::cout << msg;
}

void output(Dynamic msg) {
  std::cout << msg;
}

void output(std::string msg) {
  std::cout << msg;
}

template<typename T, typename ... Args>
void output(T arg, Args ...args) {
  std::cout << arg;

  output(args...);
};

// Input //

std::string input() {
  std::string output;

  std::cin >> output;

  return output;
}

std::string input(const char* msg) {
  std::string output;

  std::cout << msg;

  std::cin >> output;

  return output;
}

std::string input(std::string msg) {
  return input(msg.c_str());
}