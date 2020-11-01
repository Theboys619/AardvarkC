// #include "../builtIns/langCPP.cpp"
// #include <fstream>

// FileSystem Module //

// New File //

void newFile(std::string filename, std::string text) {
  std::ofstream File(filename);

  File << text;

  File.close();
}

void newFile(Dynamic filename, std::string text) {
  newFile(filename.getString(), text);
}

void newFile(Dynamic filename, Dynamic text) {
  if (text.type == text.STRING)
    newFile(filename.getString(), text.getString());
  else if (text.type == text.INT)
    newFile(filename.getString(), std::to_string(text.getInt()));
  else if (text.type == text.DOUBLE)
    newFile(filename.getString(), std::to_string(text.getDouble()));
  else if (text.type == text.BOOL) {
    std::string blntext = text.getBoolean() ? "True" : "False";
    newFile(filename.getString(), blntext);
  }
}

void newFile(std::string filename, Dynamic text) {
  if (text.type == text.STRING)
    newFile(filename, text.getString());
  else if (text.type == text.INT)
    newFile(filename, std::to_string(text.getInt()));
  else if (text.type == text.DOUBLE)
    newFile(filename, std::to_string(text.getDouble()));
  else if (text.type == text.BOOL) {
    std::string blntext = text.getBoolean() ? "True" : "False";
    newFile(filename, blntext);
  }
}

// Open File //

Dynamic open(std::string filename) {
  return Dynamic("FILE", filename);
}

Dynamic open(Dynamic filename) {
  return Dynamic("FILE", filename.getString());
}

// END FileSystem Module //