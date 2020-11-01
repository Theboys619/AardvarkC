// #include "../builtIns/langCPP.cpp"
#include <random>

Dynamic randnum() {
  std::random_device rd;
  std::mt19937 gen(rd());
  std::uniform_real_distribution<double> dis(0.0, 1.0);
  return Dynamic(dis(gen));
}

Dynamic randint(int start, int end) {
  std::random_device rd;
  std::mt19937 gen(rd());
  std::uniform_real_distribution<double> dis(0.0, 1.0);//uniform distribution between 0 and 1

  bool isNegative = (end - start < 0);
  int end_start = (!isNegative)
    ? end - start + 1
    : (end + (start - end)) - (start - (start - end)) + 1;

  return (int)((randnum() * (double)end_start) + (isNegative ? end : start)).getDouble();
}

template<typename ... Args>
Dynamic randomchoice(Args... args) {
  std::vector<Dynamic> x = {
    args...
  };

  int size = x.size();

  return x[randint(0, size-1).getInt()];
}

Dynamic factorial(int number) {
  if (number == 1) {
    return 1;
  }

  return number * factorial(number - 1);
}

Dynamic factorial(Dynamic number) {
  if (number == 1) {
    return 1;
  }

  return number * factorial(number - 1);
}