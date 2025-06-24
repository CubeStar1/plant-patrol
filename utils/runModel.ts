import { InferenceSession, Tensor } from "onnxruntime-web";

export async function createModelCpu(
    url: string
): Promise<InferenceSession> {
    console.log(url);
    try {
        return await InferenceSession.create(url, {
            executionProviders: ["wasm"],
            graphOptimizationLevel: "all",
        });
    } catch (e) {
        console.error("ONNX Runtime failed to create session:", e);
        throw new Error(`Failed to create model. See console for details.`);
    }
}

export async function runModel(
    model: InferenceSession,
    preprocessedData: Tensor
): Promise<[Tensor, number]> {

    try {
        const feeds: Record<string, Tensor> = {};
        feeds[model.inputNames[0]] = preprocessedData;
        const start = Date.now();
        const outputData = await model.run(feeds);
        const end = Date.now();
        const inferenceTime = end - start;
        const output = outputData[model.outputNames[0]];
        return [output, inferenceTime];
    } catch (e) {
        console.error(e);
        throw new Error();
    }
}
