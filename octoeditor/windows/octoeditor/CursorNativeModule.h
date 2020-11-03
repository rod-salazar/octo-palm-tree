#pragma once

#include "pch.h"

#include <functional>
#define _USE_MATH_DEFINES
#include <math.h>
#include <string>
#include <windows.h>
#include <winrt/Windows.Ui.Core.h>

#include "NativeModules.h"

using namespace winrt;
using namespace Windows::UI::Core;

namespace CursorNativeModule
{
    REACT_MODULE(Cursor);
    struct Cursor
    {
        REACT_METHOD(SetCursorTo, L"SetCursorTo");
        void SetCursorTo(std::string cursorType) noexcept
        {
            if (cursorType == "resize") {
                CoreWindow window{ CoreWindow::GetForCurrentThread() };
                window.PointerCursor(CoreCursor(CoreCursorType::SizeWestEast, 0));
            } else {
                CoreWindow window{ CoreWindow::GetForCurrentThread() };
                window.PointerCursor(CoreCursor(CoreCursorType::Arrow, 0));
            }
        }
    };
}