package com.example.codebasearchaeologist.analyzer;

public class CodeSmellThresholds {

    // These are simple, explainable heuristics — not derived from a formal
    // study, but chosen to reflect common, widely-cited rules of thumb in
    // software engineering literature (e.g. "a class with 20+ methods is
    // usually doing too much").
    public static final int GOD_CLASS_METHOD_COUNT = 15;
    public static final int LONG_PARAMETER_LIST_COUNT = 5;
    public static final int HIGH_COUPLING_DEPENDENCY_COUNT = 8;
    public static final int HUB_CLASS_DEPENDENT_COUNT = 8;

    private CodeSmellThresholds() {
        // utility class — not meant to be instantiated
    }
}