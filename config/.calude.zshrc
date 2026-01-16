# Claude Setup (~/.zshrc)
alias clauded="claude --dangerously-skip-permissions" # Claude CLI Danger Mode

alias claude-profiles="echo 'Available claude profiles:\n- claude (Personal)\n- clauded (bypass)\n- claude-agora (Agora Work)\n- clauded-agora (bypass)\n- clauded-glm (GLM Model)\n- clauded-glm (bypass)'"

alias claude-agora="CLAUDE_CONFIG_DIR=~/.claude-agora claude"
alias clauded-agora="CLAUDE_CONFIG_DIR=~/.claude-agora clauded"

claude-glm() {
    echo "[Claude GLM mode]"
  env \
    ANTHROPIC_AUTH_TOKEN="b782d5a3cc554a87b67e0bd68d0c5365.QOPyPWA8VTEmRk44" \
    ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic" \
    API_TIMEOUT_MS=3000000 \
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1 \
    ANTHROPIC_DEFAULT_HAIKU_MODEL="glm-4.5-air" \
    ANTHROPIC_DEFAULT_SONNET_MODEL="glm-4.7" \
    ANTHROPIC_DEFAULT_OPUS_MODEL="glm-4.7" \
    command claude "$@"
}

clauded-glm() {
    echo "[Claude GLM mode]"
  env \
    ANTHROPIC_AUTH_TOKEN="b782d5a3cc554a87b67e0bd68d0c5365.QOPyPWA8VTEmRk44" \
    ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic" \
    API_TIMEOUT_MS=3000000 \
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1 \
    ANTHROPIC_DEFAULT_HAIKU_MODEL="glm-4.5-air" \
    ANTHROPIC_DEFAULT_SONNET_MODEL="glm-4.7" \
    ANTHROPIC_DEFAULT_OPUS_MODEL="glm-4.7" \
    command claude --dangerously-skip-permissions "$@"
}
