// Optional macOS verification of actual exported PNGs, using the native decoder.
import Foundation
import Vision
import ImageIO
for path in CommandLine.arguments.dropFirst() {
    let url = URL(fileURLWithPath: path)
    let request = VNDetectBarcodesRequest()
    request.symbologies = [.qr]
    try VNImageRequestHandler(url: url).perform([request])
    let values = (request.results ?? []).compactMap { $0.payloadStringValue }
    guard values.count == 1 else { fatalError("Expected exactly one QR in \(path), found \(values)") }
    let row: [String: Any] = ["file": path, "target": values[0]]
    let json = try JSONSerialization.data(withJSONObject: row, options: [.sortedKeys])
    print(String(data: json, encoding: .utf8)!)
}
