import ExpoModulesCore
import PDFKit

public class PdfTextExtractorModule: Module {
  public func definition() -> ModuleDefinition {
    Name("PdfTextExtractor")

    AsyncFunction("extractText") { (filePath: String) -> String in
      // Strip file:// scheme if present
      let path: String
      if filePath.hasPrefix("file://") {
        path = String(filePath.dropFirst(7))
      } else {
        path = filePath
      }

      // Percent-decode the path (handles spaces and special chars)
      guard let decodedPath = path.removingPercentEncoding else {
        throw NSError(domain: "PdfTextExtractor", code: 1,
                      userInfo: [NSLocalizedDescriptionKey: "Invalid file path encoding"])
      }

      guard let url = URL(fileURLWithPath: decodedPath) as URL?,
            let document = PDFDocument(url: url) else {
        throw NSError(domain: "PdfTextExtractor", code: 2,
                      userInfo: [NSLocalizedDescriptionKey: "Could not open PDF at path: \(decodedPath)"])
      }

      var fullText = ""
      for i in 0..<document.pageCount {
        if let page = document.page(at: i),
           let pageText = page.string {
          fullText += pageText + "\n"
        }
      }

      return fullText
    }
  }
}
