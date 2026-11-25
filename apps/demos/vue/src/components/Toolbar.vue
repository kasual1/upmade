<template>
  <div class="demo-toolbar">
    <slot />
  </div>
</template>

<!-- Unscoped so slotted toolbar content (buttons, labels, separators) is styled too. -->
<style>
.demo-toolbar {
  display: flex;
  position: relative;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fafaf8;
  border-bottom: 2px solid #0a0a0a;
  flex-wrap: wrap;
}

.demo-toolbar > button {
  padding: 6px 12px;
  border: 2px solid #0a0a0a;
  border-radius: 999px;
  background: #ffffff;
  color: #0a0a0a;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  font-weight: 600;
}

.demo-toolbar > button:hover:not(:disabled) {
  background: #e2faeb;
  color: #0a0a0a;
  border-color: #0a0a0a;
}

.demo-toolbar > button.active {
  background: #19793c;
  color: #ffffff;
  border-color: #0a0a0a;
}

.demo-toolbar > button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.demo-toolbar > .label {
  font-size: 13px;
  font-weight: 500;
}

.demo-toolbar > .status {
  font-size: 12px;
  color: #555;
}

.demo-toolbar > .separator {
  width: 1px;
  height: 20px;
  background: #ddd;
}

.demo-toolbar > input {
  width: 70px;
  padding: 4px 8px;
  border: 2px solid #0a0a0a;
  border-radius: 10px;
  font-size: 13px;
}
</style>
