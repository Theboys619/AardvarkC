#include <iostream>
#include <string>

class Dynamic
{
  public:

  enum TYPES {
    STRING,
    INT,
    DOUBLE,
    BOOL
  } type;

  std::string str;
  int num;
  double flt;
  bool bln;

  Dynamic(const char* x) {
    type = STRING;

    str = x;
  };
  Dynamic(std::string x) {
    type = STRING;

    str = x;
  }
  Dynamic(int x) {
    type = INT;

    num = x;
  };
  Dynamic(double x) {
    type = DOUBLE;

    flt = x;
  };
  Dynamic(bool x) {
    type = BOOL;

    bln = x;
  };
  Dynamic() {
    type = BOOL;

    bln = 0;
  }

  // Assignment Operators //

  std::string operator= (std::string x) {
    type = STRING;

    str = x;
    return str;
  };

  int operator= (int x) {
    type = INT;

    num = x;
    return num;
  };

  double operator= (double x) {
    type = DOUBLE;

    flt = x;
    return flt;
  };

  bool operator= (bool x) {
    type = BOOL;

    bln = x;
    return bln;
  };

  Dynamic operator+ (int x) {
    if (type == INT) {
      return Dynamic(num + x);
    } else if (type == DOUBLE) {
      return Dynamic(flt + (double)x);
    } else if (type == STRING) {
      return Dynamic(str + std::to_string(x));
    }
    
    return (*this);
  }
  Dynamic operator+ (double x) {
    if (type == INT) {
      return Dynamic(num + (int)x);
    } else if (type == DOUBLE) {
      return Dynamic(flt + x);
    } else if (type == STRING) {
      return Dynamic(str + std::to_string(x));
    }
    
    return (*this);
  }
  Dynamic operator+ (const char* x) {
    if (type == STRING) {
      return Dynamic(str + x);
    }
    
    return (*this);
  }
  Dynamic operator+ (std::string x) {
    if (type == STRING) {
      return Dynamic(str + x);
    }
    
    return (*this);
  }
  Dynamic operator+ (Dynamic x) {
    if (type == INT) {
      if (x.type == DOUBLE)
        return num + (int)flt;

      return Dynamic(num + x.num);
    } else if (type == DOUBLE) {
      if (x.type == INT)
        return flt + (double)x.num;

      return Dynamic(flt + x.flt);
    } else if (type == STRING) {
      if (type == INT)
        return Dynamic(str + std::to_string(x.num));
      else if (type == DOUBLE)
        return Dynamic(str + std::to_string(x.flt));
      
      return Dynamic(str + x.str);
    }
    
    return (*this);
  }

  Dynamic operator- (int x) {
    if (type == INT) {
      return Dynamic(num - x);
    } else if (type == DOUBLE) {
      return Dynamic(flt - (double)x);
    }
    
    return (*this);
  }
  Dynamic operator- (double x) {
    if (type == INT) {
      return Dynamic(num - (int)x);
    } else if (type == DOUBLE) {
      return Dynamic(flt - x);
    }
    
    return (*this);
  }
  Dynamic operator- (Dynamic x) {
    if (type == INT) {
      if (x.type == DOUBLE)
        return num - (int)flt;

      return Dynamic(num - x.num);
    } else if (type == DOUBLE) {
      if (x.type == INT)
        return flt - (double)x.num;

      return Dynamic(flt - x.flt);
    }
    
    return (*this);
  }
  
  friend Dynamic operator- (int x, Dynamic y) {
    if (y.type == INT) {
      return Dynamic(x - y.num);
    } else if (y.type == DOUBLE) {
      return Dynamic(x - (int)y.flt);
    }

    return Dynamic(x);
  }
  friend Dynamic operator- (double x, Dynamic y) {
    if (y.type == INT) {
      return Dynamic(x - (double)y.num);
    } else if (y.type == DOUBLE) {
      return Dynamic(x - y.flt);
    }

    return Dynamic(x);
  }

  Dynamic operator* (int x) {
    if (type == INT) {
      return Dynamic(num * x);
    } else if (type == DOUBLE) {
      return Dynamic(flt * (double)x);
    }
    
    return (*this);
  }
  Dynamic operator* (double x) {
    if (type == INT) {
      return Dynamic(num * (int)x);
    } else if (type == DOUBLE) {
      return Dynamic(flt * x);
    }
    
    return (*this);
  }
  Dynamic operator* (Dynamic x) {
    if (type == INT) {
      if (x.type == DOUBLE)
        return num * (int)flt;

      return Dynamic(num * x.num);
    } else if (type == DOUBLE) {
      if (x.type == INT)
        return flt * (double)x.num;

      return Dynamic(flt * x.flt);
    }
    
    return (*this);
  }

  friend Dynamic operator* (int x, Dynamic y) {
    if (y.type == INT) {
      return Dynamic(x * y.num);
    } else if (y.type == DOUBLE) {
      return Dynamic(x * (int)y.flt);
    }

    return Dynamic(x);
  }
  friend Dynamic operator* (double x, Dynamic y) {
    if (y.type == INT) {
      return Dynamic(x * (double)y.num);
    } else if (y.type == DOUBLE) {
      return Dynamic(x * y.flt);
    }

    return Dynamic(x);
  }

  Dynamic operator/ (int x) {
    if (type == INT) {
      return Dynamic(num / x);
    } else if (type == DOUBLE) {
      return Dynamic(flt / (double)x);
    }
    
    return (*this);
  }
  Dynamic operator/ (double x) {
    if (type == INT) {
      return Dynamic(num / (int)x);
    } else if (type == DOUBLE) {
      return Dynamic(flt / x);
    }
    
    return (*this);
  }
  Dynamic operator/ (Dynamic x) {
    if (type == INT) {
      if (x.type == DOUBLE)
        return num * (int)flt;

      return Dynamic(num / x.num);
    } else if (type == DOUBLE) {
      if (x.type == INT)
        return flt / (double)x.num;

      return Dynamic(flt / x.flt);
    }
    
    return (*this);
  }
  
  friend Dynamic operator/ (int x, Dynamic y) {
    if (y.type == INT) {
      return Dynamic(x / y.num);
    } else if (y.type == DOUBLE) {
      return Dynamic(x / (int)y.flt);
    }

    return Dynamic(x);
  }
  friend Dynamic operator/ (double x, Dynamic y) {
    if (y.type == INT) {
      return Dynamic(x / (double)y.num);
    } else if (y.type == DOUBLE) {
      return Dynamic(x / y.flt);
    }

    return Dynamic(x);
  }

  friend Dynamic operator+ (std::string x, Dynamic y) {
    if (y.type == STRING) {
      return Dynamic(x + y.str);
    } else if (y.type == INT) {
      return Dynamic(x + std::to_string(y.num));
    } else if (y.type == DOUBLE) {
      return Dynamic(x + std::to_string(y.flt));
    } else if (y.type == BOOL) {
      return Dynamic(x + std::to_string(y.bln));
    }

    return Dynamic(x);
  }
  friend Dynamic operator+ (int x, Dynamic y) {
    if (y.type == INT) {
      return Dynamic(x + y.num);
    } else if (y.type == DOUBLE) {
      return Dynamic(x + (int)y.flt);
    }

    return Dynamic(x);
  }
  friend Dynamic operator+ (double x, Dynamic y) {
    if (y.type == INT) {
      return Dynamic(x + (double)y.num);
    } else if (y.type == DOUBLE) {
      return Dynamic(x + y.flt);
    }

    return Dynamic(x);
  }

  int operator++ (int) {
    if (type == INT) {
      return ++num;
    } else if (type == DOUBLE) {
      flt += 1.0;
      return flt;
    }

    throw "Cannot increment a non int type";
  };
  int operator++ () {
    if (type == INT) {
      return num++;
    } else {
      double old = flt;
      flt += 1.0;
      return old;
    }

    throw "Cannot increment a non int type";
  };
  int operator-- (int) {
    if (type == INT) {
      return --num;
    } else {
      flt -= 1;
      return flt;
    }

    throw "Cannot decrement a non int type";
  };
  int operator-- () {
    if (type == INT) {
      return num--;
    } else {
      double old = flt;
      flt -= 1;
      return old;
    }

    throw "Cannot decrement a non int type";
  };

  void operator+= (int x) {
    if (type == INT) {
      num += x;

      return;
    } else if (type == DOUBLE) {
      flt += (double)x;

      return;
    } else if (type == STRING) {
      str = str + std::to_string(x);

      return;
    };

    throw "Cannot add assign a non int type";
  };
  void operator+= (double x) {
    if (type == DOUBLE) {
      flt += x;

      return;
    } else if (type == INT) {
      type = DOUBLE;
      flt = (double)num + x;

      return;
    } else if (type == STRING) {
      str = str + std::to_string(x);
      return;
    };

    throw "Cannot add assign a non double/int type";
  };
  void operator+= (const char* x) {
    if (type == STRING) {
      str = str + x;
      
      return;
    };

    throw "Cannot add assign a non string type";
  };
  Dynamic operator+= (Dynamic x) {
    if (type == STRING) {
      str = str + x.str;
    } else if (type == INT) {
      if (x.type == DOUBLE)
        num += (int)x.flt;
      else
        num += x.num;
    } else if (type == DOUBLE) {
      if (x.type == INT)
        flt += (double)x.num;
      else
        flt += x.flt;
    }
    
    return (*this);
  }
  
  int operator-= (int x) {
    if (type == INT) {
      num -= x;
      return num;
    };

    throw "Cannot subtract assign a non int type";
  };
  double operator-= (double x) {
    if (type == DOUBLE) {
      flt += x;
      return flt;
    } else if (type == INT) {
      type = DOUBLE;
      flt = (double)num - x;
      return flt;
    };

    throw "Cannot subtract assign a non double/int type";
  };

  // Other Operators //



  // Comparison Operators //

  bool operator> (int x) {
    if (type == INT) {
      return num > x;
    } else if (type == DOUBLE) {
      return flt > (double)x;
    }

    return false;
  };
  bool operator> (double x) {
    if (type == INT) {
      return (double)num > x;
    } else if (type == DOUBLE) {
      return flt > x;
    }

    return false;
  };

  bool operator>= (int x) {
    if (type == INT) {
      return num >= x;
    } else if (type == DOUBLE) {
      return flt >= (double)x;
    }

    return false;
  };
  bool operator>= (double x) {
    if (type == INT) {
      return (double)num >= x;
    } else if (type == DOUBLE) {
      return flt >= (double)x;
    }

    return false;
  };

  bool operator< (int x) {
    if (type == INT) {
      return num < x;
    } else if (type == DOUBLE) {
      return flt < (double)x;
    }

    return false;
  };
  bool operator< (double x) {
    if (type == INT) {
      return (double)num < x;
    } else if (type == DOUBLE) {
      return flt < (double)x;
    }

    return false;
  };

  bool operator<= (int x) {
    if (type == INT) {
      return num <= x;
    } else if (type == DOUBLE) {
      return flt <= (double)x;
    }

    return false;
  };
  bool operator<= (double x) {
    if (type == INT) {
      return (double)num <= x;
    } else if (type == DOUBLE) {
      return flt <= (double)x;
    }

    return false;
  };

  bool operator== (int x) {
    if (type == INT) {
      return num == x;
    } else if (type == DOUBLE) {
      return flt == (double)x;
    } else if (type == STRING) {
      return str == std::to_string(x);
    }

    return false;
  };
  bool operator== (double x) {
    if (type == INT) {
      return (double)num == x;
    } else if (type == DOUBLE) {
      return flt == (double)x;
    } else if (type == STRING) {
      return str == std::to_string(x);
    }

    return false;
  };
  bool operator== (bool x) {
    if (type == INT) {
      return num == x;
    } else if (type == DOUBLE) {
      return flt == (double)x;
    } else if (type == BOOL) {
      return bln == x;
    }

    return false;
  };
  bool operator== (std::string x) {
    if (type == STRING) {
      return str == x;
    }

    return false;
  }

  friend bool operator== (std::string x, Dynamic y) {
    return y == x;
  }
  friend bool operator== (int x, Dynamic y) {
    return y == x;
  }
  friend bool operator== (double x, Dynamic y) {
    return y == x;
  }
  friend bool operator== (bool x, Dynamic y) {
    return y == x;
  }
};

inline std::ostream& operator<< (std::ostream& out, const Dynamic& dynamic) {
  int type = dynamic.type;
  if (type == dynamic.STRING) {
    out << std::string(dynamic.str);
  } else if (type == dynamic.INT) {
    out << dynamic.num;
  } else if (type == dynamic.DOUBLE) {
    out << dynamic.flt;
  } else if (type == dynamic.BOOL) {
    out << dynamic.bln;
  }

  return out;
};