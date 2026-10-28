import { createFakePluginHost } from "@get-bb/plugin-sdk/testing";
import { describe, expect, it } from "vitest";
import plugin from "./server";

describe("the plugin's settings", () => {
  it("lists Animations, on by default, beside Web lookups", async () => {
    const host = createFakePluginHost({ pluginId: "genui" });
    await plugin(host.bb);
    expect(host.harness.registrations.settingsDescriptors).toMatchObject({
      animations: { type: "boolean", label: "Animations", default: true },
      webLookups: { type: "boolean", label: "Web lookups", default: true },
    });
  });
});

describe("the CLI stands in for the UI tools", () => {
  it("checks a block from the thread's shell, failing on a compile error", async () => {
    const host = createFakePluginHost({ pluginId: "genui" });
    await plugin(host.bb);
    const ctx = { threadId: "thr_mine00" } as never;
    const good = await host.harness.runCli(["check", "--spec", 'Card("Hi", [Text("ok")])'], ctx);
    expect(good.exitCode, good.stderr).toBe(0);
    const bad = await host.harness.runCli(["check", "--spec", 'Card("Hi", [Before("x")])'], ctx);
    expect(bad.exitCode).toBe(1);
    expect(bad.stdout).toContain("Before");
  });

  it("prints a component's examples and the app contract", async () => {
    const host = createFakePluginHost({ pluginId: "genui" });
    await plugin(host.bb);
    const answer = await host.harness.runCli(["examples", "Gauge", "app"]);
    expect(answer.exitCode, answer.stderr).toBe(0);
    expect(answer.stdout).toContain("Gauge(");
    expect(answer.stdout).toContain("genui.answer");
  });
});
