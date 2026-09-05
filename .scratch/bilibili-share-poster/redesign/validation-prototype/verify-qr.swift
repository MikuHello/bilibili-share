import Foundation
import Vision
var results: [String: [String]] = [:]
for path in CommandLine.arguments.dropFirst() {
    let request = VNDetectBarcodesRequest()
    request.symbologies = [.qr]
    try VNImageRequestHandler(url: URL(fileURLWithPath: path)).perform([request])
    results[URL(fileURLWithPath: path).lastPathComponent] = (request.results ?? []).compactMap { $0.payloadStringValue }
}
let data = try JSONSerialization.data(withJSONObject: results, options: [.prettyPrinted, .sortedKeys])
print(String(data: data, encoding: .utf8)!)
